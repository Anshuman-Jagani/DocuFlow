import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, FileText, AlertCircle, FileImage, FileCode } from 'lucide-react';
import clsx from 'clsx';

interface FileWithPreview extends File { preview?: string; id: string; }
interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number; maxSizeMB?: number; acceptedTypes?: string[]; disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];

export default function FileUploader({ onFilesSelected, maxFiles = 5, maxSizeMB = 10, acceptedTypes = DEFAULT_ACCEPTED_TYPES, disabled = false }: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); }); }, []);

  const validateFile = (file: File) => {
    if (!acceptedTypes.includes(file.type)) return `${file.name}: Invalid type`;
    if (file.size > maxSizeMB * 1024 * 1024) return `${file.name}: Exceeds ${maxSizeMB}MB`;
    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || disabled) return;
    const fileArray = Array.from(newFiles);
    const validationErrors: string[] = [];
    const validFiles: FileWithPreview[] = [];
    if (files.length + fileArray.length > maxFiles) { setErrors([`Maximum ${maxFiles} files allowed`]); return; }
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) validationErrors.push(error);
      else validFiles.push(Object.assign(file, { id: `${Date.now()}-${Math.random()}`, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined }) as FileWithPreview);
    });
    setErrors(validationErrors.length > 0 ? validationErrors : []);
    if (validFiles.length > 0) { const updated = [...files, ...validFiles]; setFiles(updated); onFilesSelected(updated); }
  }, [files, maxFiles, acceptedTypes, maxSizeMB, disabled, onFilesSelected]);

  const removeFile = (fileId: string) => {
    const f = files.find(f => f.id === fileId);
    if (f?.preview) URL.revokeObjectURL(f.preview);
    const updated = files.filter(f => f.id !== fileId);
    setFiles(updated); onFilesSelected(updated); setErrors([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-6 w-6 text-white/40" />;
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-[#F87171]/60" />;
    if (type.includes('word')) return <FileText className="h-6 w-6 text-white/30" />;
    return <FileCode className="h-6 w-6 text-white/20" />;
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300',
          isDragging && !disabled ? 'border-white/30 bg-white/5 scale-[1.01]' : 'border-[#1A1A1A] hover:border-white/15 hover:bg-[#0A0A0A]',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
      >
        <div className={clsx('inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 transition-all duration-300', isDragging ? 'bg-white/10' : 'bg-[#0A0A0A] border border-[#1A1A1A]')}>
          <Upload className={clsx('h-6 w-6 transition-colors', isDragging ? 'text-white/60' : 'text-[#333333]')} />
        </div>
        <p className="text-sm font-semibold text-white mb-1">{isDragging ? 'Release to upload' : 'Upload documents'}</p>
        <p className="text-xs text-[#333333] mb-5">Drag & drop or click to browse</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['PDF', 'DOCX', 'PNG', 'JPG'].map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-black border border-[#1A1A1A] rounded text-[9px] font-bold text-[#333333] uppercase tracking-widest">{tag}</span>
          ))}
        </div>
        <input ref={fileInputRef} type="file" multiple accept={acceptedTypes.join(',')} onChange={(e) => handleFiles(e.target.files)} className="hidden" disabled={disabled} />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 bg-[#F87171]/5 border border-[#F87171]/15 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 text-[#F87171] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#F87171] mb-1">Upload Issues</p>
              <ul className="text-xs text-[#F87171]/70 space-y-0.5">{errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
            </div>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] font-bold text-[#222222] uppercase tracking-[0.15em] mb-3">
            Selected ({files.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map(file => (
              <div key={file.id} className="group relative flex items-center p-3 bg-[#0A0A0A] border border-[#111111] rounded-lg hover:border-white/10 transition-all">
                <div className="h-10 w-10 rounded-md bg-black flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#111111]">
                  {file.preview ? <img src={file.preview} alt="" className="h-full w-full object-cover" /> : getFileIcon(file.type)}
                </div>
                <div className="ml-3 flex-1 min-w-0 pr-6">
                  <p className="text-xs font-medium text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-[#333333]">{formatFileSize(file.size)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#333333] hover:text-[#F87171] opacity-0 group-hover:opacity-100 transition-all"
                  disabled={disabled}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
