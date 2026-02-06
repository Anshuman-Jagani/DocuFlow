# DocuFlow API Reference

Quick reference guide for frontend development.

## Base URL

- **Local Development:** `http://localhost:3001`
- **Production (Railway):** `https://your-app.railway.app`

## Authentication

All endpoints except `/health`, `/api/auth/register`, and `/api/auth/login` require authentication.

### Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Get Access Token

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

## Common Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number for pagination | 1 |
| `limit` | integer | Items per page | 20 |
| `sort_by` | string | Field to sort by | varies |
| `sort_order` | string | `ASC` or `DESC` | `DESC` |

## API Endpoints

### 🏥 Health & System

#### GET /health
Basic health check (no auth required)

#### GET /api/v1/health
Health check with database connection (no auth required)

#### GET /api-docs
Swagger API documentation (no auth required)

---

### 🔐 Authentication

#### POST /api/auth/register
Register new user
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### GET /api/auth/me
Get current user profile (requires auth)

#### POST /api/auth/logout
Logout user (requires auth)

#### POST /api/auth/refresh
Refresh access token
```json
{
  "refreshToken": "eyJhbGc..."
}
```

---

### 📄 Documents

#### POST /api/upload
Upload document (multipart/form-data)
```
file: <binary>
document_type: invoice|resume|contract|receipt
```

#### GET /api/documents
List all documents
- Query params: `page`, `limit`, `document_type`, `processing_status`

#### GET /api/documents/:id
Get document by ID

#### GET /api/documents/:id/download
Download document file

#### DELETE /api/documents/:id
Delete document

---

### 🧾 Invoices

#### GET /api/invoices
List invoices
- Query params: `status`, `vendor`, `start_date`, `end_date`, `page`, `limit`

#### GET /api/invoices/:id
Get invoice by ID

#### PUT /api/invoices/:id
Update invoice
```json
{
  "status": "paid",
  "total_amount": 1500.00
}
```

#### DELETE /api/invoices/:id
Delete invoice

#### GET /api/invoices/stats
Get invoice statistics
```json
{
  "totalAmount": 50000,
  "countByStatus": { "paid": 10, "pending": 5 },
  "byCurrency": { "USD": 40000, "EUR": 10000 }
}
```

#### GET /api/invoices/export/csv
Export invoices to CSV
- Query params: same as list invoices

#### GET /api/invoices/:id/export/pdf
Export single invoice as PDF

---

### 📝 Resumes

#### GET /api/resumes
List resumes
- Query params: `name`, `email`, `min_experience`, `page`, `limit`

#### GET /api/resumes/:id
Get resume by ID

#### PUT /api/resumes/:id
Update resume

#### DELETE /api/resumes/:id
Delete resume

#### POST /api/resumes/:id/match-job
Match resume with job posting
```json
{
  "job_id": "uuid-of-job-posting"
}
```

Response:
```json
{
  "match_score": 85,
  "recommendation": "strong_yes",
  "breakdown": {
    "required_skills": 90,
    "preferred_skills": 80,
    "experience": 85
  }
}
```

---

### 📋 Contracts

#### GET /api/contracts
List contracts
- Query params: `contract_type`, `status`, `min_risk_score`, `page`, `limit`

#### GET /api/contracts/:id
Get contract by ID

#### PUT /api/contracts/:id
Update contract

#### DELETE /api/contracts/:id
Delete contract

#### GET /api/contracts/expiring
Get contracts expiring soon
- Query params: `days` (default: 30)

#### GET /api/contracts/high-risk
Get high-risk contracts
- Query params: `threshold` (default: 70)

---

### 🧾 Receipts

#### GET /api/receipts
List receipts
- Query params: `category`, `merchant`, `is_business_expense`, `start_date`, `end_date`, `page`, `limit`

#### GET /api/receipts/:id
Get receipt by ID

#### PUT /api/receipts/:id
Update receipt

#### DELETE /api/receipts/:id
Delete receipt

#### GET /api/receipts/by-category
Group receipts by expense category

#### GET /api/receipts/monthly-report
Get monthly expense report
- Query params: `year`, `month`

#### GET /api/receipts/export/csv
Export receipts to CSV

#### GET /api/receipts/:id/export/pdf
Export single receipt as PDF

---

### 💼 Job Postings

#### GET /api/jobs
List job postings
- Query params: `company`, `location`, `experience_level`, `page`, `limit`

#### POST /api/jobs
Create job posting
```json
{
  "title": "Senior Developer",
  "company": "TechCorp",
  "location": "Remote",
  "job_type": "full-time",
  "experience_level": "senior",
  "required_skills": ["JavaScript", "React"],
  "preferred_skills": ["TypeScript"],
  "description": "..."
}
```

#### GET /api/jobs/:id
Get job posting by ID

#### PUT /api/jobs/:id
Update job posting

#### DELETE /api/jobs/:id
Delete job posting

---

### 🔗 Webhooks (n8n Integration)

#### POST /api/webhooks/document-uploaded
Document uploaded webhook (no auth)

#### POST /api/webhooks/invoice-processed
Invoice processed webhook (no auth)

#### POST /api/webhooks/resume-processed
Resume processed webhook (no auth)

#### POST /api/webhooks/contract-analyzed
Contract analyzed webhook (no auth)

#### POST /api/webhooks/receipt-processed
Receipt processed webhook (no auth)

---

### 📊 Dashboard

#### GET /api/dashboard/overview
Get dashboard overview
```json
{
  "totalDocuments": 100,
  "documentsByType": {
    "invoice": 40,
    "resume": 30,
    "contract": 15,
    "receipt": 15
  },
  "recentActivity": [...],
  "trends": {...}
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Auth endpoints | 5 requests | 15 minutes |
| File uploads | 10 requests | 1 hour |
| General API | 100 requests | 15 minutes |
| Webhooks | 1000 requests | 1 hour |

## File Upload Limits

- **Max file size:** 10 MB
- **Allowed types:** PDF, DOCX, PNG, JPEG
- **MIME types:**
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `image/png`
  - `image/jpeg`

## CORS Configuration

The API supports CORS for the following origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)
- Your Vercel frontend URL (configure via `ALLOWED_ORIGINS` env variable)

## Example: Complete Flow

```javascript
// 1. Register user
const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!',
    full_name: 'John Doe'
  })
});

// 2. Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!'
  })
});
const { data: { accessToken } } = await loginResponse.json();

// 3. Upload document
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('document_type', 'invoice');

const uploadResponse = await fetch('http://localhost:3001/api/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: formData
});

// 4. Get documents
const documentsResponse = await fetch('http://localhost:3001/api/documents?page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const { data: documents } = await documentsResponse.json();
```

## Testing with Demo Data

Run the seeder to populate the database:
```bash
npm run seed
```

Demo credentials:
- **Email:** admin@docuflow.com
- **Password:** Admin123!

---

**Full API Documentation:** Visit `/api-docs` for interactive Swagger documentation

**Last Updated:** February 5, 2026  
**Version:** 1.0.0
