import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, FileImage, FileCode } from 'lucide-react';
import clsx from 'clsx';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

export default function FileUploader({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `${file.name}: Invalid file type. Accepted types: PDF, DOCX, PNG, JPEG`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `${file.name}: File size exceeds ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || disabled) return;

      const fileArray = Array.from(newFiles);
      const validationErrors: string[] = [];
      const validFiles: FileWithPreview[] = [];

      if (files.length + fileArray.length > maxFiles) {
        validationErrors.push(`Maximum ${maxFiles} files allowed`);
        setErrors(validationErrors);
        return;
      }

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
        } else {
          const fileWithPreview = Object.assign(file, {
            id: `${Date.now()}-${Math.random()}`,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
          }) as FileWithPreview;
          validFiles.push(fileWithPreview);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        setErrors([]);
      }

      if (validFiles.length > 0) {
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      }
    },
    [files, maxFiles, acceptedTypes, maxSizeMB, disabled, onFilesSelected]
  );

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
    setErrors([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-indigo-500" />;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('word')) return <FileText className="h-8 w-8 text-blue-500" />;
    return <FileCode className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
          isDragging && !disabled
            ? 'border-primary bg-primary-50 scale-[1.01]'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      >
        <div className={clsx(
          'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors',
          isDragging ? 'bg-primary-100' : 'bg-gray-100'
        )}>
          <Upload className={clsx('h-8 w-8', isDragging ? 'text-primary' : 'text-gray-400')} />
        </div>
        <p className="text-lg font-semibold text-gray-900 mb-1">
          {isDragging ? 'Release to upload' : 'Upload your documents'}
        </p>
        <p className="text-gray-500 mb-6">Drag and drop or click to browse files</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['PDF', 'DOCX', 'PNG', 'JPG'].map(tag => (
            <span key={tag} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-500 uppercase">
              {tag}
            </span>
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-6 bg-danger-50 border border-danger-100 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-danger mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-danger-900 mb-1">Upload Issues</h4>
              <ul className="text-sm text-danger-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-danger rounded-full mr-2" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File List / Grid */}
      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Selected Files ({files.length}/{maxFiles})
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group relative flex items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-200 transition-all hover:shadow-sm"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                  {file.preview ? (
                    <img src={file.preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>
                
                <div className="ml-3 flex-1 min-w-0 pr-8">
                  <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove file"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
