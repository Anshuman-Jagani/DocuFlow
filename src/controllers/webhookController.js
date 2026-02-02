const { Document, Invoice, Resume, Contract, Receipt } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responses');

/**
 * Webhook handler for document upload notifications
 * Updates document status to 'processing'
 */
const documentUploaded = async (req, res) => {
  try {
    const { document_id, document_type, timestamp } = req.body;

    logger.info('Document uploaded webhook received', {
      document_id,
      document_type,
      timestamp
    });

    // Find and update document
    const document = await Document.findByPk(document_id);

    if (!document) {
      logger.warn('Document not found for webhook', { document_id });
      return errorResponse(res, 'Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }

    // Update document status
    await document.update({
      status: 'processing'
    });

    logger.info('Document status updated to processing', {
      document_id,
      document_type
    });

    return successResponse(res, {
      message: 'Document upload acknowledged',
      document_id,
      status: 'processing'
    });
  } catch (error) {
    logger.error('Error processing document-uploaded webhook', {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, 'Failed to process webhook', 500, 'WEBHOOK_ERROR');
  }
};

/**
 * Webhook handler for processed invoice data from n8n
 * Updates invoice with extracted data and validation results
 */
const invoiceProcessed = async (req, res) => {
  try {
    const { document_id, processed_data, validation, timestamp } = req.body;

    logger.info('Invoice processed webhook received', {
      document_id,
      confidence_score: validation?.confidence_score,
      timestamp
    });

    // Find invoice by document_id
    const invoice = await Invoice.findOne({
      where: { document_id }
    });

    if (!invoice) {
      logger.warn('Invoice not found for webhook', { document_id });
      return errorResponse(res, 'Invoice not found', 404, 'INVOICE_NOT_FOUND');
    }

    // Prepare update data
    const updateData = {
      confidence_score: validation?.confidence_score || 0
    };

    // Update fields from processed_data
    if (processed_data.invoice_number) updateData.invoice_number = processed_data.invoice_number;
    if (processed_data.vendor_name) updateData.vendor_name = processed_data.vendor_name;
    if (processed_data.total_amount !== undefined) updateData.total_amount = processed_data.total_amount;
    if (processed_data.currency) updateData.currency = processed_data.currency;
    if (processed_data.issue_date) updateData.issue_date = new Date(processed_data.issue_date);
    if (processed_data.due_date) updateData.due_date = new Date(processed_data.due_date);
    if (processed_data.status) updateData.status = processed_data.status;
    if (processed_data.tax_amount !== undefined) updateData.tax_amount = processed_data.tax_amount;

    // Update JSONB fields
    if (processed_data.line_items) updateData.line_items = processed_data.line_items;
    if (validation?.errors) updateData.validation_errors = validation.errors;

    // Update invoice
    await invoice.update(updateData);

    // Update parent document status
    await Document.update(
      { status: validation?.status === 'valid' ? 'completed' : 'needs_review' },
      { where: { id: document_id } }
    );

    logger.info('Invoice updated successfully', {
      invoice_id: invoice.id,
      document_id,
      confidence_score: validation?.confidence_score
    });

    return successResponse(res, {
      message: 'Invoice processed successfully',
      invoice_id: invoice.id,
      confidence_score: validation?.confidence_score,
      status: validation?.status
    });
  } catch (error) {
    logger.error('Error processing invoice-processed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return errorResponse(res, 'Failed to process invoice webhook', 500, 'WEBHOOK_ERROR');
  }
};

/**
 * Webhook handler for processed resume data from n8n
 * Updates resume with extracted data and matching information
 */
const resumeProcessed = async (req, res) => {
  try {
    const { document_id, processed_data, validation, timestamp } = req.body;

    logger.info('Resume processed webhook received', {
      document_id,
      confidence_score: validation?.confidence_score,
      timestamp
    });

    // Find resume by document_id
    const resume = await Resume.findOne({
      where: { document_id }
    });

    if (!resume) {
      logger.warn('Resume not found for webhook', { document_id });
      return errorResponse(res, 'Resume not found', 404, 'RESUME_NOT_FOUND');
    }

    // Prepare update data
    const updateData = {
      confidence_score: validation?.confidence_score || 0
    };

    // Update fields from processed_data
    if (processed_data.candidate_name) updateData.candidate_name = processed_data.candidate_name;
    if (processed_data.email) updateData.email = processed_data.email;
    if (processed_data.phone) updateData.phone = processed_data.phone;
    if (processed_data.location) updateData.location = processed_data.location;
    if (processed_data.years_of_experience !== undefined) {
      updateData.years_of_experience = processed_data.years_of_experience;
    }
    if (processed_data.current_position) updateData.current_position = processed_data.current_position;
    if (processed_data.summary) updateData.summary = processed_data.summary;

    // Update JSONB fields
    if (processed_data.skills) updateData.skills = processed_data.skills;
    if (processed_data.experience) updateData.experience = processed_data.experience;
    if (processed_data.education) updateData.education = processed_data.education;

    // Update resume
    await resume.update(updateData);

    // Update parent document status
    await Document.update(
      { status: validation?.status === 'valid' ? 'completed' : 'needs_review' },
      { where: { id: document_id } }
    );

    logger.info('Resume updated successfully', {
      resume_id: resume.id,
      document_id,
      confidence_score: validation?.confidence_score
    });

    return successResponse(res, {
      message: 'Resume processed successfully',
      resume_id: resume.id,
      confidence_score: validation?.confidence_score,
      status: validation?.status
    });
  } catch (error) {
    logger.error('Error processing resume-processed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return errorResponse(res, 'Failed to process resume webhook', 500, 'WEBHOOK_ERROR');
  }
};

/**
 * Webhook handler for analyzed contract data from n8n
 * Updates contract with analysis results, risk assessment, and red flags
 */
const contractAnalyzed = async (req, res) => {
  try {
    const { document_id, processed_data, validation, timestamp } = req.body;

    logger.info('Contract analyzed webhook received', {
      document_id,
      confidence_score: validation?.confidence_score,
      timestamp
    });

    // Find contract by document_id
    const contract = await Contract.findOne({
      where: { document_id }
    });

    if (!contract) {
      logger.warn('Contract not found for webhook', { document_id });
      return errorResponse(res, 'Contract not found', 404, 'CONTRACT_NOT_FOUND');
    }

    // Prepare update data
    const updateData = {
      confidence_score: validation?.confidence_score || 0
    };

    // Update fields from processed_data
    if (processed_data.contract_title) updateData.contract_title = processed_data.contract_title;
    if (processed_data.contract_type) updateData.contract_type = processed_data.contract_type;
    if (processed_data.contract_value !== undefined) {
      updateData.contract_value = processed_data.contract_value;
    }
    if (processed_data.currency) updateData.currency = processed_data.currency;
    if (processed_data.start_date) updateData.start_date = new Date(processed_data.start_date);
    if (processed_data.end_date) updateData.end_date = new Date(processed_data.end_date);
    if (processed_data.status) updateData.status = processed_data.status;
    if (processed_data.risk_score !== undefined) updateData.risk_score = processed_data.risk_score;

    // Update JSONB fields
    if (processed_data.parties) updateData.parties = processed_data.parties;
    if (processed_data.payment_terms) updateData.payment_terms = processed_data.payment_terms;
    if (processed_data.obligations) updateData.obligations = processed_data.obligations;
    if (processed_data.red_flags) updateData.red_flags = processed_data.red_flags;

    // Update contract
    await contract.update(updateData);

    // Update parent document status
    await Document.update(
      { status: validation?.status === 'valid' ? 'completed' : 'needs_review' },
      { where: { id: document_id } }
    );

    logger.info('Contract updated successfully', {
      contract_id: contract.id,
      document_id,
      confidence_score: validation?.confidence_score,
      risk_score: processed_data.risk_score
    });

    return successResponse(res, {
      message: 'Contract analyzed successfully',
      contract_id: contract.id,
      confidence_score: validation?.confidence_score,
      risk_score: processed_data.risk_score,
      status: validation?.status
    });
  } catch (error) {
    logger.error('Error processing contract-analyzed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return errorResponse(res, 'Failed to process contract webhook', 500, 'WEBHOOK_ERROR');
  }
};

/**
 * Webhook handler for processed receipt data from n8n
 * Updates receipt with extracted items, merchant info, and amounts
 */
const receiptProcessed = async (req, res) => {
  try {
    const { document_id, processed_data, validation, timestamp } = req.body;

    logger.info('Receipt processed webhook received', {
      document_id,
      confidence_score: validation?.confidence_score,
      timestamp
    });

    // Find receipt by document_id
    const receipt = await Receipt.findOne({
      where: { document_id }
    });

    if (!receipt) {
      logger.warn('Receipt not found for webhook', { document_id });
      return errorResponse(res, 'Receipt not found', 404, 'RECEIPT_NOT_FOUND');
    }

    // Prepare update data
    const updateData = {
      confidence_score: validation?.confidence_score || 0
    };

    // Update fields from processed_data
    if (processed_data.merchant_name) updateData.merchant_name = processed_data.merchant_name;
    if (processed_data.total_amount !== undefined) updateData.total_amount = processed_data.total_amount;
    if (processed_data.currency) updateData.currency = processed_data.currency;
    if (processed_data.purchase_date) updateData.purchase_date = new Date(processed_data.purchase_date);
    if (processed_data.category) updateData.category = processed_data.category;
    if (processed_data.tax_amount !== undefined) updateData.tax_amount = processed_data.tax_amount;
    if (processed_data.payment_method) updateData.payment_method = processed_data.payment_method;
    if (processed_data.is_business_expense !== undefined) {
      updateData.is_business_expense = processed_data.is_business_expense;
    }

    // Update JSONB fields
    if (processed_data.items) updateData.items = processed_data.items;

    // Update receipt
    await receipt.update(updateData);

    // Update parent document status
    await Document.update(
      { status: validation?.status === 'valid' ? 'completed' : 'needs_review' },
      { where: { id: document_id } }
    );

    logger.info('Receipt updated successfully', {
      receipt_id: receipt.id,
      document_id,
      confidence_score: validation?.confidence_score
    });

    return successResponse(res, {
      message: 'Receipt processed successfully',
      receipt_id: receipt.id,
      confidence_score: validation?.confidence_score,
      status: validation?.status
    });
  } catch (error) {
    logger.error('Error processing receipt-processed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return errorResponse(res, 'Failed to process receipt webhook', 500, 'WEBHOOK_ERROR');
  }
};

module.exports = {
  documentUploaded,
  invoiceProcessed,
  resumeProcessed,
  contractAnalyzed,
  receiptProcessed
};
