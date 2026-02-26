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
      return res.status(404).json(errorResponse('DOCUMENT_NOT_FOUND', 'Document not found'));
    }

    // Update document status
    await document.update({
      processing_status: 'processing'
    });

    logger.info('Document status updated to processing', {
      document_id,
      document_type
    });

    return res.json(
      successResponse({
        message: 'Document upload acknowledged',
        document_id,
        processing_status: 'processing'
      }, 'Document upload acknowledged')
    );
  } catch (error) {
    logger.error('Error processing document-uploaded webhook', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json(errorResponse('WEBHOOK_ERROR', 'Failed to process webhook'));
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
      return res.status(404).json(errorResponse('INVOICE_NOT_FOUND', 'Invoice not found'));
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
    if (processed_data.issue_date) updateData.invoice_date = new Date(processed_data.issue_date);
    if (processed_data.due_date) updateData.due_date = new Date(processed_data.due_date);
    if (processed_data.status && ['valid', 'needs_review', 'invalid'].includes(processed_data.status)) {
      updateData.validation_status = processed_data.status;
    }
    if (processed_data.tax_amount !== undefined) updateData.tax = processed_data.tax_amount;

    // Update JSONB fields
    if (processed_data.line_items) updateData.line_items = processed_data.line_items;
    if (validation?.errors) updateData.validation_errors = validation.errors;

    // Update invoice
    await invoice.update(updateData);

    // Update parent document status
    await Document.update(
      { 
        processing_status: validation?.status === 'valid' ? 'completed' : 'needs_review',
        processed_at: new Date()
      },
      { where: { id: document_id } }
    );

    logger.info('Invoice updated successfully', {
      invoice_id: invoice.id,
      document_id,
      confidence_score: validation?.confidence_score
    });

    return res.json(
      successResponse({
        invoice_id: invoice.id,
        confidence_score: validation?.confidence_score,
        status: validation?.status
      }, 'Invoice processed successfully')
    );
  } catch (error) {
    logger.error('Error processing invoice-processed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return res.status(500).json(errorResponse('WEBHOOK_ERROR', 'Failed to process invoice webhook'));
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
      return res.status(404).json(errorResponse('RESUME_NOT_FOUND', 'Resume not found'));
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
      updateData.total_years_experience = processed_data.years_of_experience;
    }
    if (processed_data.current_position) updateData.current_position = processed_data.current_position;
    if (processed_data.summary) updateData.professional_summary = processed_data.summary;

    // Update JSONB fields
    if (processed_data.skills) updateData.skills = processed_data.skills;
    if (processed_data.experience) updateData.experience = processed_data.experience;
    if (processed_data.education) updateData.education = processed_data.education;

    // Update resume
    await resume.update(updateData);

    // Update parent document status
    await Document.update(
      { 
        processing_status: validation?.status === 'valid' ? 'completed' : 'needs_review',
        processed_at: new Date()
      },
      { where: { id: document_id } }
    );

    logger.info('Resume updated successfully', {
      resume_id: resume.id,
      document_id,
      confidence_score: validation?.confidence_score
    });

    return res.json(
      successResponse({
        resume_id: resume.id,
        confidence_score: validation?.confidence_score,
        status: validation?.status
      }, 'Resume processed successfully')
    );
  } catch (error) {
    logger.error('Error processing resume-processed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return res.status(500).json(errorResponse('WEBHOOK_ERROR', 'Failed to process resume webhook'));
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
      return res.status(404).json(errorResponse('CONTRACT_NOT_FOUND', 'Contract not found'));
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
    
    // Support both start_date/end_date (n8n) and effective_date/expiration_date (DB)
    const startDate = processed_data.effective_date || processed_data.start_date;
    const endDate = processed_data.expiration_date || processed_data.end_date;
    if (startDate) updateData.effective_date = new Date(startDate);
    if (endDate) updateData.expiration_date = new Date(endDate);

    if (processed_data.risk_score !== undefined) updateData.risk_score = processed_data.risk_score;
    if (processed_data.auto_renewal !== undefined) updateData.auto_renewal = processed_data.auto_renewal;
    if (processed_data.governing_law) updateData.governing_law = processed_data.governing_law;
    if (processed_data.summary) updateData.summary = processed_data.summary;
    
    // Support requires_legal_review from payload or derived from risk
    if (processed_data.requires_legal_review !== undefined) {
      updateData.requires_legal_review = processed_data.requires_legal_review;
    }

    // Update JSONB fields
    if (processed_data.parties) updateData.parties = processed_data.parties;
    if (processed_data.payment_terms) updateData.payment_terms = processed_data.payment_terms;
    
    // Support both 'obligations' (legacy) and 'key_obligations' (direct)
    const obligations = processed_data.key_obligations || processed_data.obligations;
    if (obligations) updateData.key_obligations = obligations;

    if (processed_data.termination_clauses) updateData.termination_clauses = processed_data.termination_clauses;
    if (processed_data.penalties) updateData.penalties = processed_data.penalties;
    if (processed_data.confidentiality_terms) updateData.confidentiality_terms = processed_data.confidentiality_terms;
    if (processed_data.liability_limitations) updateData.liability_limitations = processed_data.liability_limitations;
    if (processed_data.special_conditions) updateData.special_conditions = processed_data.special_conditions;
    if (processed_data.red_flags) updateData.red_flags = processed_data.red_flags;

    // Update contract
    await contract.update(updateData);

    // Update parent document status
    await Document.update(
      { 
        processing_status: validation?.status === 'valid' || validation?.status === 'needs_review' ? 'completed' : 'failed',
        processed_at: new Date()
      },
      { where: { id: document_id } }
    );

    logger.info('Contract updated successfully', {
      contract_id: contract.id,
      document_id,
      confidence_score: validation?.confidence_score,
      risk_score: processed_data.risk_score
    });

    return res.json(
      successResponse({
        contract_id: contract.id,
        confidence_score: validation?.confidence_score,
        risk_score: processed_data.risk_score,
        status: validation?.status
      }, 'Contract analyzed successfully')
    );
  } catch (error) {
    logger.error('Error processing contract-analyzed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return res.status(500).json(errorResponse('WEBHOOK_ERROR', 'Failed to process contract webhook'));
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
      return res.status(404).json(errorResponse('RECEIPT_NOT_FOUND', 'Receipt not found'));
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
    if (processed_data.category) updateData.expense_category = processed_data.category;
    if (processed_data.tax_amount !== undefined) updateData.tax = processed_data.tax_amount;
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
      { 
        processing_status: validation?.status === 'valid' ? 'completed' : 'needs_review',
        processed_at: new Date()
      },
      { where: { id: document_id } }
    );

    logger.info('Receipt updated successfully', {
      receipt_id: receipt.id,
      document_id,
      confidence_score: validation?.confidence_score
    });

    return res.json(
      successResponse({
        receipt_id: receipt.id,
        confidence_score: validation?.confidence_score,
        status: validation?.status
      }, 'Receipt processed successfully')
    );
  } catch (error) {
    logger.error('Error processing receipt-processed webhook', {
      error: error.message,
      stack: error.stack,
      document_id: req.body?.document_id
    });
    return res.status(500).json(errorResponse('WEBHOOK_ERROR', 'Failed to process receipt webhook'));
  }
};

module.exports = {
  documentUploaded,
  invoiceProcessed,
  resumeProcessed,
  contractAnalyzed,
  receiptProcessed
};
