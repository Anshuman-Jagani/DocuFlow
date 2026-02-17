const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Extract file metadata from uploaded file
 * @param {Object} file - Multer file object
 * @returns {Object} File metadata
 */
const extractFileMetadata = (file) => {
  return {
    originalFilename: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    filename: file.filename
  };
};

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    logger.info(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    }
    logger.error(`Error deleting file: ${filePath}`, error);
    throw error;
  }
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} Whether file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file path to prevent directory traversal
 * @param {string} filePath - Path to validate
 * @param {string} baseDir - Base directory
 * @returns {boolean} Whether path is valid
 */
const isValidFilePath = (filePath, baseDir) => {
  const resolvedPath = path.resolve(filePath);
  const resolvedBaseDir = path.resolve(baseDir);
  return resolvedPath.startsWith(resolvedBaseDir);
};

/**
 * Get file stats
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} File stats
 */
const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  } catch (error) {
    logger.error(`Error getting file stats: ${filePath}`, error);
    throw error;
  }
};

/**
 * Get absolute path for a file relative to the project root
 * @param {string} relativePath - Relative path from project root
 * @returns {string} Absolute path
 */
const getAbsolutePath = (relativePath) => {
  // If it's already an absolute path, return it
  if (path.isAbsolute(relativePath)) return relativePath;
  
  // Resolve relative to the backend project root (two levels up from src/services)
  return path.resolve(__dirname, '../../', relativePath);
};

module.exports = {
  extractFileMetadata,
  deleteFile,
  fileExists,
  isValidFilePath,
  getFileStats,
  getAbsolutePath
};
