import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import FileUploader from '../components/ui/FileUploader';
import documentService, { type UploadProgress } from '../services/documentService';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import clsx from 'clsx';

type DocumentType = 'invoice' | 'resume' | 'contract' | 'receipt';

// Selected accent per type
const DOC_TYPE_COLORS: Record<DocumentType, string> = {
  invoice:  'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]',
  receipt:  'border-[#4ADE80] bg-[#4ADE80]/10 text-[#4ADE80]',
  resume:   'border-[#A78BFA] bg-[#A78BFA]/10 text-[#A78BFA]',
  contract: 'border-[#FBBF24] bg-[#FBBF24]/10 text-[#FBBF24]',
};

export default function Upload() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleFilesSelected = (files: File[]) => setSelectedFiles(files);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    const progressMap = new Map<string, UploadProgress>();
    selectedFiles.forEach((file) => {
      progressMap.set(file.name, { fileName: file.name, progress: 0, status: 'uploading' });
    });
    setUploadProgress(new Map(progressMap));

    for (const file of selectedFiles) {
      try {
        await documentService.uploadDocument(file as File, documentType, (progress) => {
          progressMap.set(file.name, { fileName: file.name, progress, status: 'uploading' });
          setUploadProgress(new Map(progressMap));
        });
        progressMap.set(file.name, { fileName: file.name, progress: 100, status: 'success' });
        setUploadProgress(new Map(progressMap));
      } catch (error: any) {
        progressMap.set(file.name, {
          fileName: file.name, progress: 0, status: 'error',
          error: error.response?.data?.message || 'Upload failed',
        });
        setUploadProgress(new Map(progressMap));
      }
    }
    setIsUploading(false);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setUploadProgress(new Map());
    setResetKey(prev => prev + 1);
  };

  const allUploadsComplete = uploadProgress.size > 0 &&
    Array.from(uploadProgress.values()).every(p => p.status !== 'uploading');
  const successCount = Array.from(uploadProgress.values()).filter(p => p.status === 'success').length;
  const errorCount = Array.from(uploadProgress.values()).filter(p => p.status === 'error').length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Upload Documents</h1>
          <p className="text-[#444444] mt-2">
            Upload your documents for processing. Supported formats: PDF, DOCX, PNG, JPEG
          </p>
        </div>

        {/* Document Type Selector */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 mb-6">
          <label className="block text-[10px] font-bold text-[#444444] uppercase tracking-widest mb-3">
            Document Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['invoice', 'receipt', 'resume', 'contract'] as DocumentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setDocumentType(type)}
                disabled={isUploading}
                className={clsx(
                  'px-4 py-3 rounded-lg border-2 font-medium transition-all capitalize text-sm',
                  documentType === type
                    ? DOC_TYPE_COLORS[type]
                    : 'border-[#111111] bg-black text-[#444444] hover:border-[#5A5A5A] hover:text-white',
                  isUploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* File Uploader */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 mb-6">
          <FileUploader
            key={resetKey}
            onFilesSelected={handleFilesSelected}
            maxFiles={10}
            maxSizeMB={10}
            disabled={isUploading}
          />
        </div>

        {/* Upload Progress */}
        {uploadProgress.size > 0 && (
          <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 mb-6">
            <h3 className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.2em] mb-4">Upload Progress</h3>
            <div className="space-y-3">
              {Array.from(uploadProgress.values()).map((progress) => (
                <div key={progress.fileName} className="border border-[#111111] bg-black rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white truncate flex-1">
                      {progress.fileName}
                    </span>
                    {progress.status === 'uploading' && (
                      <Loader className="h-5 w-5 text-[#888888] animate-spin ml-2" />
                    )}
                    {progress.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-success ml-2" />
                    )}
                    {progress.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-danger ml-2" />
                    )}
                  </div>
                  {progress.status === 'uploading' && (
                    <div className="w-full bg-[#1A1A1A] rounded-full h-1.5">
                      <div
                        className="bg-[#A0A0A0] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                  {progress.status === 'error' && progress.error && (
                    <p className="text-sm text-danger mt-1">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>

            {allUploadsComplete && (
              <div className="mt-4 p-4 bg-black border border-[#111111] rounded-lg">
                <p className="text-sm text-[#888888]">
                  <span className="font-semibold text-success">{successCount} successful</span>
                  {errorCount > 0 && (
                    <>{' • '}<span className="font-semibold text-danger">{errorCount} failed</span></>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {allUploadsComplete ? (
            <>
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-[#111111] text-[#888888] rounded-lg hover:bg-[#111111] hover:text-white transition-colors"
              >
                Upload More
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="px-6 py-2 bg-[#0A0A0A] border border-[#A0A0A0] text-[#888888] rounded-lg hover:bg-[#111111] hover:shadow-glow-white-sm transition-colors font-medium"
              >
                View Documents
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                disabled={isUploading}
                className="px-6 py-2 border border-[#111111] text-[#444444] rounded-lg hover:bg-[#111111] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-6 py-2 bg-[#0A0A0A] border border-[#A0A0A0] text-[#888888] rounded-lg hover:bg-[#111111] hover:shadow-glow-white-sm transition-colors font-medium flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
