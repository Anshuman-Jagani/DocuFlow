import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import FileUploader from '../components/ui/FileUploader';
import documentService, { type UploadProgress } from '../services/documentService';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import clsx from 'clsx';

type DocumentType = 'invoice' | 'resume' | 'contract' | 'receipt';

export default function Upload() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const [resetKey, setResetKey] = useState(0);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const progressMap = new Map<string, UploadProgress>();

    // Initialize progress for all files
    selectedFiles.forEach((file) => {
      progressMap.set(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      });
    });
    setUploadProgress(new Map(progressMap));

    // Upload files sequentially
    for (const file of selectedFiles) {
      try {
        await documentService.uploadDocument(file as File, documentType, (progress) => {
          progressMap.set(file.name, {
            fileName: file.name,
            progress,
            status: 'uploading',
          });
          setUploadProgress(new Map(progressMap));
        });

        // Mark as success
        progressMap.set(file.name, {
          fileName: file.name,
          progress: 100,
          status: 'success',
        });
        setUploadProgress(new Map(progressMap));
      } catch (error: any) {
        // Mark as error
        progressMap.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: 'error',
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
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-2">
            Upload your documents for processing. Supported formats: PDF, DOCX, PNG, JPEG
          </p>
        </div>

        {/* Document Type Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Document Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['invoice', 'receipt', 'resume', 'contract'] as DocumentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setDocumentType(type)}
                disabled={isUploading}
                className={clsx(
                  'px-4 py-3 rounded-lg border-2 font-medium transition-all capitalize',
                  documentType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                  isUploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* File Uploader */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
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
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
            <div className="space-y-3">
              {Array.from(uploadProgress.values()).map((progress) => (
                <div key={progress.fileName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {progress.fileName}
                    </span>
                    {progress.status === 'uploading' && (
                      <Loader className="h-5 w-5 text-blue-500 animate-spin ml-2" />
                    )}
                    {progress.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {progress.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                    )}
                  </div>
                  {progress.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                  )}
                  {progress.status === 'error' && progress.error && (
                    <p className="text-sm text-red-600 mt-1">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            {allUploadsComplete && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-green-600">{successCount} successful</span>
                  {errorCount > 0 && (
                    <>
                      {' • '}
                      <span className="font-semibold text-red-600">{errorCount} failed</span>
                    </>
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
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload More
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Documents
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                disabled={isUploading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
