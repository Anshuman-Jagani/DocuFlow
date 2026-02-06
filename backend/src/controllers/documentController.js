const { Document, Invoice, Receipt, Resume, Contract } = require('../models');
const { extractFileMetadata, deleteFile, fileExists } = require('../services/fileService');
const { successResponse, errorResponse } = require('../utils/responses');
const { getPaginationParams } = require('../utils/pagination');
const logger = require('../utils/logger');

/**
 * Upload a document
 * POST /api/upload
 */
const uploadDocument = async (req, res) => {
  try {
    const { document_type } = req.body;
    const file = req.file;
    
    // Extract file metadata
    const metadata = extractFileMetadata(file);
    
    // Create document record
    const document = await Document.create({
      user_id: req.user.id,
      document_type,
      original_filename: metadata.originalFilename,
      file_path: metadata.filePath,
      file_size: metadata.fileSize,
      mime_type: metadata.mimeType,
      processing_status: 'pending'
    });
    
    // Create specialized document record based on type
    switch (document_type) {
      case 'invoice':
        await Invoice.create({
          user_id: req.user.id,
          document_id: document.id,
          status: 'pending'
        });
        break;
      case 'receipt':
        await Receipt.create({
          user_id: req.user.id,
          document_id: document.id
        });
        break;
      case 'resume':
        await Resume.create({
          user_id: req.user.id,
          document_id: document.id
        });
        break;
      case 'contract':
        await Contract.create({
          user_id: req.user.id,
          document_id: document.id
        });
        break;
    }
    
    logger.info(`Document uploaded successfully: ${document.id}`, {
      userId: req.user.id,
      documentType: document_type,
      filename: metadata.originalFilename
    });
    
    return res.status(201).json(
      successResponse('Document uploaded successfully', {
        document: {
          id: document.id,
          document_type: document.document_type,
          original_filename: document.original_filename,
          file_size: document.file_size,
          mime_type: document.mime_type,
          processing_status: document.processing_status,
          upload_date: document.upload_date
        }
      })
    );
  } catch (error) {
    logger.error('Error uploading document:', error);
    
    // Clean up uploaded file if database insert fails
    if (req.file && req.file.path) {
      await deleteFile(req.file.path).catch(err => 
        logger.error('Error cleaning up file after failed upload:', err)
      );
    }
    
    return res.status(500).json(
      errorResponse('UPLOAD_FAILED', 'Failed to upload document')
    );
  }
};

/**
 * Get all documents with pagination and filters
 * GET /api/documents
 */
const listDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, document_type, processing_status, sort_by = 'upload_date', order = 'DESC' } = req.query;
    
    // Build where clause
    const where = { user_id: req.user.id };
    
    if (document_type) {
      where.document_type = document_type;
    }
    
    if (processing_status) {
      where.processing_status = processing_status;
    }
    
    // Get pagination params
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Query documents
    const { count, rows: documents } = await Document.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [[sort_by, order.toUpperCase()]],
      attributes: ['id', 'document_type', 'original_filename', 'file_size', 'mime_type', 'processing_status', 'upload_date', 'processed_at']
    });
    
    // Build pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const pagination = {
      page: parsedPage,
      limit: parsedLimit,
      total: count,
      totalPages
    };
    
    return res.json(
      successResponse('Documents retrieved successfully', {
        documents
      }, {
        pagination
      })
    );
  } catch (error) {
    logger.error('Error listing documents:', error);
    return res.status(500).json(
      errorResponse('FETCH_FAILED', 'Failed to retrieve documents')
    );
  }
};

/**
 * Get a single document by ID
 * GET /api/documents/:id
 */
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });
    
    if (!document) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Document not found')
      );
    }
    
    return res.json(
      successResponse('Document retrieved successfully', {
        document
      })
    );
  } catch (error) {
    logger.error('Error getting document:', error);
    return res.status(500).json(
      errorResponse('FETCH_FAILED', 'Failed to retrieve document')
    );
  }
};

/**
 * Download a document
 * GET /api/documents/:id/download
 */
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });
    
    if (!document) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Document not found')
      );
    }
    
    // Check if file exists
    const exists = await fileExists(document.file_path);
    if (!exists) {
      logger.error(`File not found on disk: ${document.file_path}`);
      return res.status(404).json(
        errorResponse('FILE_NOT_FOUND', 'File not found on server')
      );
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_filename}"`);
    
    // Stream file to response
    const path = require('path');
    res.sendFile(path.resolve(document.file_path), (err) => {
      if (err) {
        logger.error('Error sending file:', err);
        if (!res.headersSent) {
          return res.status(500).json(
            errorResponse('DOWNLOAD_FAILED', 'Failed to download file')
          );
        }
      }
    });
  } catch (error) {
    logger.error('Error downloading document:', error);
    return res.status(500).json(
      errorResponse('DOWNLOAD_FAILED', 'Failed to download document')
    );
  }
};

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });
    
    if (!document) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Document not found')
      );
    }
    
    // Delete file from filesystem
    const filePath = document.file_path;
    await deleteFile(filePath);
    
    // Delete database record
    await document.destroy();
    
    logger.info(`Document deleted successfully: ${id}`, {
      userId: req.user.id,
      filename: document.original_filename
    });
    
    return res.json(
      successResponse('Document deleted successfully', {
        id
      })
    );
  } catch (error) {
    logger.error('Error deleting document:', error);
    return res.status(500).json(
      errorResponse('DELETE_FAILED', 'Failed to delete document')
    );
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  downloadDocument,
  deleteDocument
};
