const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadSingle, validateDocumentType } = require('../middleware/upload');
const {
  uploadDocument,
  listDocuments,
  getDocument,
  downloadDocument,
  deleteDocument
} = require('../controllers/documentController');

/**
 * @route   POST /api/upload
 * @desc    Upload a document
 * @access  Private
 */
router.post('/upload', 
  authenticate,
  uploadSingle('file'),
  validateDocumentType,
  uploadDocument
);

/**
 * @route   GET /api/documents
 * @desc    Get all documents with pagination and filters
 * @access  Private
 * @query   page, limit, document_type, processing_status, sort_by, order
 */
router.get('/documents',
  authenticate,
  listDocuments
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document by ID
 * @access  Private
 */
router.get('/documents/:id',
  authenticate,
  getDocument
);

/**
 * @route   GET /api/documents/:id/download
 * @desc    Download a document
 * @access  Private
 */
router.get('/documents/:id/download',
  authenticate,
  downloadDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/documents/:id',
  authenticate,
  deleteDocument
);

module.exports = router;
