import api from './api';
import type { ApiResponse, Document } from '../types';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

class DocumentService {
  async uploadDocument(
    file: File,
    documentType: 'invoice' | 'resume' | 'contract' | 'receipt',
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await api.post<ApiResponse<Document>>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data.data;
  }

  async getDocuments(params?: {
    page?: number;
    limit?: number;
    document_type?: string;
    processing_status?: string;
    search?: string;
  }): Promise<{ documents: Document[]; pagination: any }> {
    const response = await api.get<any>('/api/documents', { params });
    return {
      documents: response.data.data,
      pagination: response.data.meta?.pagination || {},
    };
  }

  async getDocument(id: string | number): Promise<Document> {
    const response = await api.get<ApiResponse<Document>>(`/api/documents/${id}`);
    return response.data.data;
  }

  async deleteDocument(id: string | number): Promise<void> {
    await api.delete(`/api/documents/${id}`);
  }

  async downloadDocument(id: string | number, filename: string): Promise<void> {
    const response = await api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new DocumentService();