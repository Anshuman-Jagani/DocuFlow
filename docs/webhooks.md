# Webhook Documentation

This document describes how to integrate with the DocuFlow webhook system. All webhooks are secured using HMAC SHA-256 signatures and timestamp validation.

## Security

Every webhook request includes two security headers:

- `X-Webhook-Signature`: HMAC SHA-256 hash of the request body using `N8N_WEBHOOK_SECRET`.
- `X-Webhook-Timestamp`: Current Unix timestamp in milliseconds.

### Verification Flow

1. The server checks if the `X-Webhook-Timestamp` is within the last 5 minutes to prevent replay attacks.
2. The server generates an HMAC SHA-256 signature of the raw request body using the shared secret.
3. The server performs a timing-safe comparison between the generated signature and the provided `X-Webhook-Signature`.

## Webhook Endpoints

All webhook endpoints are `POST` requests.

### 1. Document Uploaded
**Endpoint**: `/api/webhooks/document-uploaded`
**Payload**:
```json
{
  "document_id": "uuid",
  "document_type": "invoice",
  "timestamp": "ISO8601"
}
```
**Effect**: Changes document status from `pending` to `processing`.

---

### 2. Invoice Processed
**Endpoint**: `/api/webhooks/invoice-processed`
**Payload**:
```json
{
  "document_id": "uuid",
  "processed_data": {
    "invoice_number": "string",
    "vendor_name": "string",
    "total_amount": number,
    "currency": "string",
    "issue_date": "YYYY-MM-DD",
    "due_date": "YYYY-MM-DD",
    "status": "string",
    "tax_amount": number,
    "line_items": [
      { "description": "string", "quantity": number, "unit_price": number, "total": number }
    ]
  },
  "validation": {
    "status": "valid|needs_review|invalid",
    "confidence_score": number (0-100),
    "errors": ["string"]
  }
}
```
**Effect**: Updates the associated invoice record and sets document status to `completed` or `needs_review`.

---

### 3. Resume Processed
**Endpoint**: `/api/webhooks/resume-processed`
**Payload**:
```json
{
  "document_id": "uuid",
  "processed_data": {
    "candidate_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "years_of_experience": number,
    "current_position": "string",
    "skills": ["string"],
    "experience": [],
    "education": []
  },
  "validation": {
    "status": "valid|needs_review|invalid",
    "confidence_score": number
  }
}
```
**Effect**: Updates the associated resume record and sets document status.

---

### 4. Contract Analyzed
**Endpoint**: `/api/webhooks/contract-analyzed`
**Payload**:
```json
{
  "document_id": "uuid",
  "processed_data": {
    "contract_title": "string",
    "contract_type": "string",
    "contract_value": number,
    "risk_score": number (0-100),
    "parties": [],
    "red_flags": ["string"]
  },
  "validation": {
    "status": "valid|needs_review|invalid",
    "confidence_score": number
  }
}
```
**Effect**: Updates the associated contract record and sets document status.

---

### 5. Receipt Processed
**Endpoint**: `/api/webhooks/receipt-processed`
**Payload**:
```json
{
  "document_id": "uuid",
  "processed_data": {
    "merchant_name": "string",
    "total_amount": number,
    "category": "string",
    "is_business_expense": boolean,
    "items": []
  },
  "validation": {
    "status": "valid|needs_review|invalid",
    "confidence_score": number
  }
}
```
**Effect**: Updates the associated receipt record and sets document status.

## Example n8n Verification Script (JavaScript)

```javascript
const crypto = require('crypto');

const payload = JSON.stringify(body);
const secret = "YOUR_WEBHOOK_SECRET";
const timestamp = Date.now().toString();

const hmac = crypto.createHmac('sha256', secret);
hmac.update(payload);
const signature = hmac.digest('hex');

// Use signature in X-Webhook-Signature header
// Use timestamp in X-Webhook-Timestamp header
```
