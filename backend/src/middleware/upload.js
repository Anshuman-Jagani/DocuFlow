const { upload } = require('../config/upload');
const { errorResponse } = require('../utils/responses');

/**
 * Middleware to handle single file upload
 * @param {string} fieldName - The name of the file field in the form
 */
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        // Handle Multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSize = process.env.MAX_FILE_SIZE || 10485760;
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
          return res.status(400).json(
            errorResponse('FILE_TOO_LARGE', `File size exceeds the maximum limit of ${maxSizeMB}MB`)
          );
        }
        
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json(
            errorResponse('INVALID_FILE_TYPE', err.message)
          );
        }
        
        return res.status(400).json(
          errorResponse('UPLOAD_ERROR', err.message)
        );
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json(
          errorResponse('NO_FILE', 'No file uploaded. Please provide a file.')
        );
      }
      
      next();
    });
  };
};

/**
 * Middleware to validate document type
 */
const validateDocumentType = (req, res, next) => {
  const { document_type } = req.body;
  const allowedTypes = ['invoice', 'resume', 'contract', 'receipt'];
  
  if (!document_type) {
    return res.status(400).json(
      errorResponse('MISSING_DOCUMENT_TYPE', 'document_type is required')
    );
  }
  
  if (!allowedTypes.includes(document_type)) {
    return res.status(400).json(
      errorResponse('INVALID_DOCUMENT_TYPE', `document_type must be one of: ${allowedTypes.join(', ')}`)
    );
  }
  
  next();
};

module.exports = {
  uploadSingle,
  validateDocumentType
};
