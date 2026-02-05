# DocuFlow Backend Integration Specification for n8n

**Version**: 1.0.0  
**Last Updated**: 2026-02-05  
**Backend Version**: 1.0.0  
**API Base URL**: `http://localhost:3001/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Docker Infrastructure](#docker-infrastructure)
3. [Environment Variables](#environment-variables)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Webhook Integration](#webhook-integration)
7. [File Handling](#file-handling)
8. [Authentication & Security](#authentication--security)
9. [Data Flow by Document Type](#data-flow-by-document-type)
10. [Business Logic & Validation](#business-logic--validation)
11. [Error Handling](#error-handling)
12. [Code Examples](#code-examples)

---

## Overview

DocuFlow is an intelligent document processing system that integrates with n8n for AI-powered document analysis. The backend provides REST APIs for document upload and management, while n8n handles AI processing via webhooks.

### Architecture Flow
```
User → Backend API → Upload Document → n8n Webhook (Process) → Backend Webhook (Update)
```

### Supported Document Types
- **Invoice**: Extract vendor info, line items, amounts, tax details
- **Resume**: Parse candidate info, skills, experience, education
- **Contract**: Analyze parties, terms, obligations, risk assessment
- **Receipt**: Extract merchant, items, amounts, expense categorization

---

## Docker Infrastructure

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: docuflow-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: docprocessing
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - docuflow-network

  # Optional: Backend API container
  api:
    build: .
    container_name: docuflow-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/docprocessing
      - DB_HOST=postgres
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
    networks:
      - docuflow-network

  # n8n container (add this)
  n8n:
    image: n8nio/n8n:latest
    container_name: docuflow-n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
      - WEBHOOK_URL=http://n8n:5678/
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - docuflow-network

volumes:
  postgres_data:
  n8n_data:

networks:
  docuflow-network:
    driver: bridge
```

### Container Communication

| Container | Internal Network | External Port | Purpose |
|-----------|-----------------|---------------|---------|
| `docuflow-postgres` | `postgres:5432` | `localhost:5432` | PostgreSQL database |
| `docuflow-api` | `api:3001` | `localhost:3001` | Backend REST API |
| `docuflow-n8n` | `n8n:5678` | `localhost:5678` | n8n workflow engine |

**Network**: All containers communicate via `docuflow-network` bridge network.

---

## Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Database (Docker internal)
DATABASE_URL=postgresql://postgres:password@postgres:5432/docprocessing
DB_HOST=postgres
DB_PORT=5432
DB_NAME=docprocessing
DB_USER=postgres
DB_PASSWORD=password

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=30d

# n8n Integration
N8N_WEBHOOK_SECRET=your-webhook-secret-shared-with-n8n-instance
N8N_BASE_URL=http://n8n:5678

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173,http://localhost:5678

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### n8n Configuration

```bash
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin
WEBHOOK_URL=http://n8n:5678/
WEBHOOK_SECRET=your-webhook-secret-shared-with-n8n-instance
BACKEND_API_URL=http://api:3001/api
```

---

## Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### 2. Documents Table

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('invoice', 'resume', 'contract', 'receipt')),
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'needs_review')),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(processing_status);
```

### 3. Invoices Table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100),
  invoice_date DATE,
  due_date DATE,
  vendor_name VARCHAR(255),
  vendor_address TEXT,
  vendor_tax_id VARCHAR(100),
  vendor_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_address TEXT,
  line_items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  payment_terms VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  validation_status VARCHAR(20) CHECK (validation_status IN ('valid', 'needs_review', 'invalid')),
  validation_errors JSONB DEFAULT '[]',
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_document_id ON invoices(document_id);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_name);
```

**JSONB Structure - line_items**:
```json
[
  {
    "description": "Product A",
    "quantity": 2,
    "unit_price": 100.00,
    "amount": 200.00
  }
]
```

### 4. Resumes Table

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  candidate_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  professional_summary TEXT,
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  skills JSONB DEFAULT '{"technical":[],"soft_skills":[],"tools":[]}',
  certifications JSONB DEFAULT '[]',
  total_years_experience DECIMAL(4,1),
  job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  match_breakdown JSONB DEFAULT '{}',
  matched_skills JSONB DEFAULT '[]',
  missing_skills JSONB DEFAULT '[]',
  recommendation VARCHAR(20) CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resumes_document_id ON resumes(document_id);
CREATE INDEX idx_resumes_candidate ON resumes(candidate_name);
```

**JSONB Structures**:
```json
{
  "skills": {
    "technical": ["JavaScript", "Python", "React"],
    "soft_skills": ["Leadership", "Communication"],
    "tools": ["Git", "Docker", "AWS"]
  },
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "start_date": "2020-01",
      "end_date": "2023-12",
      "responsibilities": ["Led team of 5", "Built microservices"]
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "B.S. Computer Science",
      "graduation_year": 2019
    }
  ]
}
```

### 5. Contracts Table

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  contract_title VARCHAR(255),
  contract_type VARCHAR(100),
  contract_value DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  parties JSONB DEFAULT '[]',
  effective_date DATE,
  expiration_date DATE,
  auto_renewal BOOLEAN DEFAULT false,
  payment_terms JSONB DEFAULT '{}',
  key_obligations JSONB DEFAULT '[]',
  termination_clauses JSONB DEFAULT '[]',
  penalties JSONB DEFAULT '[]',
  confidentiality_terms TEXT,
  liability_limitations TEXT,
  governing_law VARCHAR(255),
  special_conditions JSONB DEFAULT '[]',
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  red_flags JSONB DEFAULT '[]',
  requires_legal_review BOOLEAN DEFAULT false,
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contracts_document_id ON contracts(document_id);
CREATE INDEX idx_contracts_expiration ON contracts(expiration_date);
```

**JSONB Structures**:
```json
{
  "parties": [
    {"name": "Company A", "role": "Service Provider"},
    {"name": "Company B", "role": "Client"}
  ],
  "payment_terms": {
    "amount": 10000,
    "frequency": "monthly",
    "due_date": 15
  },
  "red_flags": [
    "Unlimited liability clause",
    "No termination clause"
  ]
}
```

### 6. Receipts Table

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  merchant_name VARCHAR(255),
  purchase_date DATE,
  purchase_time TIME,
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2),
  tip DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50),
  expense_category VARCHAR(100),
  is_business_expense BOOLEAN DEFAULT false,
  is_reimbursable BOOLEAN DEFAULT false,
  tax_deductible BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_receipts_document_id ON receipts(document_id);
CREATE INDEX idx_receipts_merchant ON receipts(merchant_name);
CREATE INDEX idx_receipts_category ON receipts(expense_category);
```

**JSONB Structure - items**:
```json
[
  {
    "name": "Latte",
    "quantity": 2,
    "unit_price": 4.50,
    "amount": 9.00
  }
]
```

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Document Upload Endpoint

#### Upload Document
```http
POST /api/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary file data]
document_type: invoice|resume|contract|receipt
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "document_type": "invoice",
      "original_filename": "invoice_2024.pdf",
      "file_size": 245678,
      "mime_type": "application/pdf",
      "processing_status": "pending",
      "upload_date": "2026-02-05T12:00:00.000Z"
    }
  }
}
```

**Supported File Types**:
- `application/pdf`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `image/png`
- `image/jpeg`

**Max File Size**: 10MB (10,485,760 bytes)

### Document Management Endpoints

#### List Documents
```http
GET /api/documents?page=1&limit=20&document_type=invoice&processing_status=completed
Authorization: Bearer {accessToken}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "id": "uuid",
        "document_type": "invoice",
        "original_filename": "invoice.pdf",
        "file_size": 245678,
        "mime_type": "application/pdf",
        "processing_status": "completed",
        "upload_date": "2026-02-05T12:00:00.000Z",
        "processed_at": "2026-02-05T12:05:00.000Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### Get Document
```http
GET /api/documents/{id}
Authorization: Bearer {accessToken}
```

#### Download Document
```http
GET /api/documents/{id}/download
Authorization: Bearer {accessToken}
```

#### Delete Document
```http
DELETE /api/documents/{id}
Authorization: Bearer {accessToken}
```

---

## Webhook Integration

### Webhook Endpoints (Called by n8n)

#### 1. Document Uploaded Notification
```http
POST /api/webhooks/document-uploaded
Content-Type: application/json

{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "document_type": "invoice",
  "timestamp": "2026-02-05T12:00:00.000Z"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "message": "Document upload acknowledged",
    "document_id": "550e8400-e29b-41d4-a716-446655440000",
    "processing_status": "processing"
  }
}
```

#### 2. Invoice Processed
```http
POST /api/webhooks/invoice-processed
Content-Type: application/json

{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "processed_data": {
    "invoice_number": "INV-2024-001",
    "vendor_name": "Acme Corp",
    "total_amount": 1500.00,
    "currency": "USD",
    "issue_date": "2024-01-15",
    "due_date": "2024-02-15",
    "status": "valid",
    "tax_amount": 150.00,
    "line_items": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "unit_price": 135.00,
        "amount": 1350.00
      }
    ]
  },
  "validation": {
    "status": "valid",
    "confidence_score": 95,
    "errors": []
  },
  "timestamp": "2026-02-05T12:05:00.000Z"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "confidence_score": 95,
    "status": "valid"
  },
  "message": "Invoice processed successfully"
}
```

#### 3. Resume Processed
```http
POST /api/webhooks/resume-processed
Content-Type: application/json

{
  "document_id": "uuid",
  "processed_data": {
    "candidate_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "years_of_experience": 5.5,
    "current_position": "Senior Developer",
    "summary": "Experienced full-stack developer...",
    "skills": {
      "technical": ["JavaScript", "Python", "React", "Node.js"],
      "soft_skills": ["Leadership", "Communication"],
      "tools": ["Git", "Docker", "AWS"]
    },
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer",
        "start_date": "2020-01",
        "end_date": "present",
        "responsibilities": ["Led team", "Built microservices"]
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "B.S. Computer Science",
        "graduation_year": 2018
      }
    ]
  },
  "validation": {
    "status": "valid",
    "confidence_score": 92
  },
  "timestamp": "2026-02-05T12:05:00.000Z"
}
```

#### 4. Contract Analyzed
```http
POST /api/webhooks/contract-analyzed
Content-Type: application/json

{
  "document_id": "uuid",
  "processed_data": {
    "contract_title": "Software Development Agreement",
    "contract_type": "Service Agreement",
    "contract_value": 50000.00,
    "currency": "USD",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "risk_score": 35,
    "parties": [
      {"name": "Company A", "role": "Service Provider"},
      {"name": "Company B", "role": "Client"}
    ],
    "payment_terms": {
      "amount": 50000,
      "frequency": "monthly",
      "installments": 12
    },
    "obligations": [
      "Deliver software within 6 months",
      "Provide 1 year warranty"
    ],
    "red_flags": [
      "Unlimited liability clause"
    ]
  },
  "validation": {
    "status": "needs_review",
    "confidence_score": 88
  },
  "timestamp": "2026-02-05T12:05:00.000Z"
}
```

#### 5. Receipt Processed
```http
POST /api/webhooks/receipt-processed
Content-Type: application/json

{
  "document_id": "uuid",
  "processed_data": {
    "merchant_name": "Starbucks",
    "total_amount": 15.50,
    "currency": "USD",
    "purchase_date": "2024-01-15",
    "category": "Food & Beverage",
    "tax_amount": 1.50,
    "payment_method": "Credit Card",
    "is_business_expense": true,
    "items": [
      {
        "name": "Latte",
        "quantity": 2,
        "unit_price": 5.00,
        "amount": 10.00
      },
      {
        "name": "Croissant",
        "quantity": 1,
        "unit_price": 4.00,
        "amount": 4.00
      }
    ]
  },
  "validation": {
    "status": "valid",
    "confidence_score": 98
  },
  "timestamp": "2026-02-05T12:05:00.000Z"
}
```

---

## File Handling

### Method: Local Filesystem with File Path

**Storage Location**: `./uploads/documents/`

**Filename Format**: `{uuid}-{timestamp}-{sanitized_original_name}.{ext}`

**Example**: `550e8400-1706789123456-invoice_acme.pdf`

### How Files Are Sent to n8n

**Option 1: File Path (Recommended for Docker)**
```json
{
  "document_id": "uuid",
  "file_path": "/app/uploads/documents/550e8400-1706789123456-invoice.pdf",
  "document_type": "invoice"
}
```

n8n can access the file via shared Docker volume:
```yaml
volumes:
  - ./uploads:/app/uploads  # Backend
  - ./uploads:/data/uploads  # n8n
```

**Option 2: Base64 Encoding**
```javascript
// In n8n workflow
const fs = require('fs');
const filePath = items[0].json.file_path;
const fileBuffer = fs.readFileSync(filePath);
const base64 = fileBuffer.toString('base64');
```

**Option 3: HTTP Download**
```javascript
// n8n HTTP Request node
{
  "method": "GET",
  "url": "http://api:3001/api/documents/{{$json.document_id}}/download",
  "headers": {
    "Authorization": "Bearer {{$env.BACKEND_API_TOKEN}}"
  },
  "responseFormat": "file"
}
```

---

## Authentication & Security

### JWT Authentication

**Access Token**: 7 days expiry  
**Refresh Token**: 30 days expiry  
**Algorithm**: HS256

**Header Format**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Webhook Security (Currently Disabled)

**Note**: Signature and timestamp verification have been removed for easier manual testing. For production, implement HMAC SHA-256 signature verification.

**Production Implementation**:
```javascript
// Generate signature (n8n side)
const crypto = require('crypto');
const payload = JSON.stringify(requestBody);
const timestamp = Date.now();
const signature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(`${timestamp}.${payload}`)
  .digest('hex');

// Headers
headers: {
  'X-Webhook-Signature': signature,
  'X-Webhook-Timestamp': timestamp
}
```

### Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth endpoints | 5 requests | 15 minutes |
| File upload | 10 requests | 1 hour |
| General API | 100 requests | 15 minutes |
| Webhooks | 1000 requests | 1 hour |

### Input Sanitization

All inputs are sanitized using `express-validator` and custom middleware to prevent:
- SQL Injection
- XSS attacks
- Path traversal
- Malicious file uploads

---

## Data Flow by Document Type

### Invoice Processing Flow

```
1. User uploads invoice PDF
   ↓
2. Backend: Create Document + Invoice record (status: pending)
   ↓
3. Backend: Trigger n8n webhook (document-uploaded)
   ↓
4. n8n: Download file, extract text (OCR/PDF parsing)
   ↓
5. n8n: AI processing (extract invoice data)
   ↓
6. n8n: Validate data (check totals, dates, required fields)
   ↓
7. n8n: POST to /api/webhooks/invoice-processed
   ↓
8. Backend: Update Invoice + Document (status: completed/needs_review)
   ↓
9. Optional: Send email notification if validation fails
```

### Resume Processing Flow

```
1. User uploads resume PDF/DOCX
   ↓
2. Backend: Create Document + Resume record
   ↓
3. n8n: Extract candidate info, skills, experience
   ↓
4. n8n: Structure data into JSONB format
   ↓
5. n8n: POST to /api/webhooks/resume-processed
   ↓
6. Backend: Update Resume record
   ↓
7. Optional: Auto-match with job postings (POST /api/resumes/:id/match-job)
```

### Contract Processing Flow

```
1. User uploads contract PDF
   ↓
2. Backend: Create Document + Contract record
   ↓
3. n8n: Extract parties, terms, dates
   ↓
4. n8n: Risk assessment (identify red flags)
   ↓
5. n8n: Calculate risk score (0-100)
   ↓
6. n8n: POST to /api/webhooks/contract-analyzed
   ↓
7. Backend: Update Contract record
   ↓
8. If risk_score > 70: Set requires_legal_review = true
   ↓
9. Optional: Send alert email for high-risk contracts
```

### Receipt Processing Flow

```
1. User uploads receipt image/PDF
   ↓
2. Backend: Create Document + Receipt record
   ↓
3. n8n: OCR processing (extract text from image)
   ↓
4. n8n: Extract merchant, items, amounts
   ↓
5. n8n: Categorize expense (Food, Travel, Office, etc.)
   ↓
6. n8n: POST to /api/webhooks/receipt-processed
   ↓
7. Backend: Update Receipt record
   ↓
8. Optional: Check if business expense, flag for reimbursement
```

---

## Business Logic & Validation

### Invoice Validation Rules

```javascript
{
  "validation_rules": {
    "required_fields": ["invoice_number", "vendor_name", "total_amount", "invoice_date"],
    "amount_validation": "subtotal + tax = total_amount (±0.01 tolerance)",
    "date_validation": "due_date >= invoice_date",
    "confidence_threshold": 80,
    "auto_approval": "confidence_score >= 95 && validation_status === 'valid'"
  }
}
```

**Status Logic**:
- `confidence_score >= 95` → `validation_status: valid`, `processing_status: completed`
- `confidence_score 70-94` → `validation_status: needs_review`, `processing_status: needs_review`
- `confidence_score < 70` → `validation_status: invalid`, `processing_status: failed`

### Resume Matching Algorithm

**Scoring Weights**:
- Required skills match: 60%
- Preferred skills bonus: 20%
- Experience level match: 20%

```javascript
// Calculation
const requiredSkillsMatch = (matchedRequired / totalRequired) * 60;
const preferredSkillsBonus = (matchedPreferred / totalPreferred) * 20;
const experienceMatch = (candidateYears >= jobMinYears) ? 20 : (candidateYears / jobMinYears) * 20;
const totalScore = requiredSkillsMatch + preferredSkillsBonus + experienceMatch;
```

**Recommendation Mapping**:
- `score >= 90` → `strong_yes`
- `score 75-89` → `yes`
- `score 60-74` → `maybe`
- `score 40-59` → `no`
- `score < 40` → `strong_no`

### Contract Risk Assessment

**Risk Score Calculation** (0-100):
```javascript
let riskScore = 0;

// Red flags (+10 each)
riskScore += red_flags.length * 10;

// Contract value (higher = more risk)
if (contract_value > 100000) riskScore += 15;
else if (contract_value > 50000) riskScore += 10;

// Duration (longer = more risk)
const durationMonths = (expiration_date - effective_date) / (30 * 24 * 60 * 60 * 1000);
if (durationMonths > 36) riskScore += 10;

// Missing key clauses
if (!termination_clauses.length) riskScore += 15;
if (!liability_limitations) riskScore += 10;

// Cap at 100
riskScore = Math.min(riskScore, 100);
```

**Auto-flagging**:
- `risk_score >= 70` → `requires_legal_review = true`
- `red_flags.length >= 3` → `requires_legal_review = true`

### Receipt Categorization

**Auto-categorization Rules**:
```javascript
const categories = {
  "Food & Beverage": ["restaurant", "cafe", "starbucks", "mcdonald"],
  "Transportation": ["uber", "lyft", "taxi", "parking", "gas"],
  "Office Supplies": ["staples", "office depot", "amazon"],
  "Travel": ["hotel", "airbnb", "airline", "expedia"],
  "Utilities": ["electric", "water", "internet", "phone"]
};
```

**Business Expense Detection**:
- Check merchant against known business vendors
- Amount > $50 → flag for review
- Weekday purchases more likely business

### Email Notification Triggers

```javascript
const emailTriggers = {
  "invoice": {
    "validation_status === 'invalid'": "Invoice validation failed",
    "total_amount > 10000": "High-value invoice requires approval",
    "due_date < 7 days": "Invoice due soon"
  },
  "contract": {
    "risk_score >= 70": "High-risk contract detected",
    "expiration_date < 30 days": "Contract expiring soon"
  },
  "receipt": {
    "total_amount > 500": "Large expense requires approval"
  }
};
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NO_TOKEN` | 401 | Missing authentication token |
| `INVALID_TOKEN` | 401 | Invalid JWT token |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `FILE_TOO_LARGE` | 400 | File exceeds 10MB limit |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |
| `MISSING_DOCUMENT_TYPE` | 400 | document_type field required |
| `UPLOAD_FAILED` | 500 | File upload failed |
| `WEBHOOK_ERROR` | 500 | Webhook processing failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Webhook Error Handling

**n8n Retry Strategy**:
```javascript
{
  "retries": 3,
  "retryDelay": 5000, // 5 seconds
  "retryOn": [500, 502, 503, 504],
  "timeout": 30000 // 30 seconds
}
```

**Backend Error Logging**:
```javascript
logger.error('Webhook processing failed', {
  error: error.message,
  stack: error.stack,
  document_id: req.body.document_id,
  webhook_type: 'invoice-processed'
});
```

---

## Code Examples

### 1. File Upload Handler (Backend)

```javascript
// src/controllers/documentController.js
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
    
    // Create specialized document record
    switch (document_type) {
      case 'invoice':
        await Invoice.create({
          user_id: req.user.id,
          document_id: document.id,
          status: 'pending'
        });
        break;
      // ... other cases
    }
    
    // Trigger n8n webhook (optional - can use n8n polling instead)
    // await triggerN8nWebhook(document);
    
    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document }
    });
  } catch (error) {
    logger.error('Upload failed:', error);
    
    // Cleanup file on error
    if (req.file?.path) {
      await deleteFile(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload document'
      }
    });
  }
};
```

### 2. n8n Workflow - Document Upload Trigger

```javascript
// n8n Webhook Node (Trigger)
{
  "nodes": [
    {
      "name": "Poll Documents",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "http://api:3001/api/documents",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "qs": {
          "processing_status": "pending",
          "limit": 10
        }
      },
      "executeOnce": false,
      "continueOnFail": false,
      "alwaysOutputData": false,
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000
    },
    {
      "name": "Download File",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=http://api:3001/api/documents/{{$json.id}}/download",
        "authentication": "genericCredentialType",
        "responseFormat": "file"
      }
    },
    {
      "name": "Extract Text",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "=pdftotext {{$binary.data.fileName}} -"
      }
    },
    {
      "name": "AI Processing",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "model": "gpt-4",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "Extract invoice data from the following text..."
            },
            {
              "role": "user",
              "content": "={{$json.output}}"
            }
          ]
        }
      }
    },
    {
      "name": "Send to Backend",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://api:3001/api/webhooks/invoice-processed",
        "bodyParameters": {
          "parameters": [
            {
              "name": "document_id",
              "value": "={{$node['Poll Documents'].json.id}}"
            },
            {
              "name": "processed_data",
              "value": "={{$json.extracted_data}}"
            },
            {
              "name": "validation",
              "value": "={{$json.validation}}"
            }
          ]
        }
      }
    }
  ]
}
```

### 3. Webhook Receiver (Backend)

```javascript
// src/controllers/webhookController.js
const invoiceProcessed = async (req, res) => {
  try {
    const { document_id, processed_data, validation, timestamp } = req.body;

    logger.info('Invoice processed webhook received', {
      document_id,
      confidence_score: validation?.confidence_score
    });

    // Find invoice
    const invoice = await Invoice.findOne({
      where: { document_id }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVOICE_NOT_FOUND',
          message: 'Invoice not found'
        }
      });
    }

    // Prepare update data
    const updateData = {
      confidence_score: validation?.confidence_score || 0,
      invoice_number: processed_data.invoice_number,
      vendor_name: processed_data.vendor_name,
      total_amount: processed_data.total_amount,
      currency: processed_data.currency,
      invoice_date: new Date(processed_data.issue_date),
      due_date: new Date(processed_data.due_date),
      validation_status: processed_data.status,
      tax: processed_data.tax_amount,
      line_items: processed_data.line_items,
      validation_errors: validation?.errors || []
    };

    // Update invoice
    await invoice.update(updateData);

    // Update parent document
    await Document.update(
      { 
        processing_status: validation?.status === 'valid' ? 'completed' : 'needs_review',
        processed_at: new Date()
      },
      { where: { id: document_id } }
    );

    logger.info('Invoice updated successfully', {
      invoice_id: invoice.id,
      confidence_score: validation?.confidence_score
    });

    return res.json({
      success: true,
      data: {
        invoice_id: invoice.id,
        confidence_score: validation?.confidence_score,
        status: validation?.status
      },
      message: 'Invoice processed successfully'
    });
  } catch (error) {
    logger.error('Webhook processing failed', {
      error: error.message,
      document_id: req.body?.document_id
    });
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'WEBHOOK_ERROR',
        message: 'Failed to process invoice webhook'
      }
    });
  }
};
```

### 4. Database Operations

```javascript
// Query invoices with JSONB filtering
const invoices = await Invoice.findAll({
  where: {
    user_id: req.user.id,
    total_amount: { [Op.gte]: 1000 },
    line_items: {
      [Op.contains]: [{ description: 'Consulting' }]
    }
  },
  order: [['invoice_date', 'DESC']],
  limit: 20
});

// Update JSONB field
await invoice.update({
  validation_errors: sequelize.fn(
    'jsonb_set',
    sequelize.col('validation_errors'),
    '{0}',
    JSON.stringify({ field: 'total_amount', error: 'Mismatch' })
  )
});

// Query with JSONB path
const resumes = await Resume.findAll({
  where: sequelize.literal(
    "skills->'technical' @> '[\"JavaScript\"]'::jsonb"
  )
});
```

### 5. Complete n8n Workflow Example (Invoice Processing)

```json
{
  "name": "Invoice Processing Workflow",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "minutes", "minutesInterval": 5}]
        }
      }
    },
    {
      "name": "Get Pending Documents",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://api:3001/api/documents",
        "qs": {
          "processing_status": "pending",
          "document_type": "invoice"
        },
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth"
      }
    },
    {
      "name": "Loop Documents",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1
      }
    },
    {
      "name": "Download PDF",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "=http://api:3001/api/documents/{{$json.id}}/download",
        "responseFormat": "file"
      }
    },
    {
      "name": "Extract Text (OCR)",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "=tesseract {{$binary.data.fileName}} stdout"
      }
    },
    {
      "name": "AI Extract Data",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "resource": "chat",
        "model": "gpt-4",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "content": "Extract invoice data as JSON with fields: invoice_number, vendor_name, total_amount, currency, issue_date, due_date, line_items (array with description, quantity, unit_price, amount)"
            },
            {
              "role": "user",
              "content": "={{$json.stdout}}"
            }
          ]
        },
        "options": {
          "temperature": 0.1
        }
      }
    },
    {
      "name": "Parse JSON",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "extracted_data",
              "value": "={{JSON.parse($json.message.content)}}"
            }
          ]
        }
      }
    },
    {
      "name": "Validate Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const data = $input.item.json.extracted_data;\nlet errors = [];\nlet confidence = 100;\n\n// Validate required fields\nif (!data.invoice_number) { errors.push('Missing invoice number'); confidence -= 20; }\nif (!data.vendor_name) { errors.push('Missing vendor name'); confidence -= 20; }\nif (!data.total_amount) { errors.push('Missing total amount'); confidence -= 30; }\n\n// Validate amounts\nconst lineTotal = data.line_items.reduce((sum, item) => sum + item.amount, 0);\nif (Math.abs(lineTotal - data.total_amount) > 0.01) {\n  errors.push('Line items total does not match total amount');\n  confidence -= 15;\n}\n\nconst status = confidence >= 95 ? 'valid' : confidence >= 70 ? 'needs_review' : 'invalid';\n\nreturn {\n  json: {\n    processed_data: data,\n    validation: {\n      status,\n      confidence_score: confidence,\n      errors\n    }\n  }\n};"
      }
    },
    {
      "name": "Send to Backend",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://api:3001/api/webhooks/invoice-processed",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "document_id",
              "value": "={{$node['Get Pending Documents'].json.id}}"
            },
            {
              "name": "processed_data",
              "value": "={{$json.processed_data}}"
            },
            {
              "name": "validation",
              "value": "={{$json.validation}}"
            },
            {
              "name": "timestamp",
              "value": "={{new Date().toISOString()}}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {"main": [[{"node": "Get Pending Documents"}]]},
    "Get Pending Documents": {"main": [[{"node": "Loop Documents"}]]},
    "Loop Documents": {"main": [[{"node": "Download PDF"}]]},
    "Download PDF": {"main": [[{"node": "Extract Text (OCR)"}]]},
    "Extract Text (OCR)": {"main": [[{"node": "AI Extract Data"}]]},
    "AI Extract Data": {"main": [[{"node": "Parse JSON"}]]},
    "Parse JSON": {"main": [[{"node": "Validate Data"}]]},
    "Validate Data": {"main": [[{"node": "Send to Backend"}]]}
  }
}
```

---

## Network Connectivity Details

### Container-to-Container Communication

**Within Docker Network** (`docuflow-network`):
- Backend → PostgreSQL: `postgres:5432`
- Backend → n8n: `n8n:5678`
- n8n → Backend API: `http://api:3001/api`
- n8n → PostgreSQL: `postgres:5432` (if needed for direct queries)

### External Access (from host machine)

- Backend API: `http://localhost:3001/api`
- n8n UI: `http://localhost:5678`
- PostgreSQL: `localhost:5432`

### Production Deployment

For production, use environment-specific URLs:
```bash
# Production .env
N8N_BASE_URL=https://n8n.yourdomain.com
BACKEND_API_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://user:pass@db.yourdomain.com:5432/docprocessing
```

---

## Quick Start Guide

### 1. Start Infrastructure

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f n8n
```

### 2. Initialize Database

```bash
# Run migrations
docker-compose exec api npm run migrate

# Or from host (if running locally)
npm run migrate
```

### 3. Create Test User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

### 4. Upload Document

```bash
# Get token from login response
TOKEN="your-jwt-token"

# Upload invoice
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@invoice.pdf" \
  -F "document_type=invoice"
```

### 5. Configure n8n Workflow

1. Access n8n UI: `http://localhost:5678`
2. Import workflow JSON (see example above)
3. Set credentials for Backend API (JWT token)
4. Activate workflow
5. Test with uploaded document

---

## Support & Troubleshooting

### Common Issues

**Issue**: Cannot connect to PostgreSQL  
**Solution**: Ensure `docuflow-postgres` container is running and healthy

**Issue**: File upload fails  
**Solution**: Check `uploads/documents` directory permissions and disk space

**Issue**: Webhook not receiving data  
**Solution**: Verify n8n can reach `http://api:3001` (check Docker network)

**Issue**: High memory usage  
**Solution**: Limit file processing concurrency in n8n workflow

### Logs

```bash
# Backend logs
docker-compose logs -f api

# n8n logs
docker-compose logs -f n8n

# PostgreSQL logs
docker-compose logs -f postgres

# Application logs (Winston)
tail -f logs/app.log
```

---

**End of Specification**
