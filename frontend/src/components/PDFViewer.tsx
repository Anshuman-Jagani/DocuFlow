import React, { useState } from 'react';

interface PDFViewerProps {
  fileUrl: string;
  filename: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, filename }) => {
  const [zoom, setZoom] = useState(100);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2.5">
        {/* File name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
            {filename}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-1 py-1">
            {/* Zoom Out — magnifier with minus */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11h6" />
              </svg>
            </button>

            {/* Zoom level — clickable to reset */}
            <button
              onClick={handleResetZoom}
              className="min-w-[3rem] h-7 px-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-md transition-colors tabular-nums"
              title="Reset zoom to 100%"
            >
              {zoom}%
            </button>

            {/* Zoom In — magnifier with plus */}
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 8v6M8 11h6" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-center">
          <iframe
            src={fileUrl}
            className="bg-white shadow-lg rounded-lg"
            style={{
              width: `${zoom}%`,
              minHeight: '800px',
              border: 'none',
            }}
            title={filename}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
