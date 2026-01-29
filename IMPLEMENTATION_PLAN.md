# Implementation Plan: Intelligent Document Processing System

## Project Overview

**Repository**: https://github.com/Anshuman-Jagani/DocuFlow.git  
**Timeline**: 15 working days (3 weeks × 5 days)  
**Current Progress**: Day 2 Complete (13.3%)

---

## Technology Stack

### Backend
- **Framework**: Node.js v18+ with Express.js v4.18+
- **Database**: PostgreSQL v14+ with Sequelize ORM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer with Sharp for image processing
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

### Development Tools
- **Testing**: Jest + Supertest
- **Dev Server**: Nodemon
- **Code Quality**: ESLint + Prettier
- **Containerization**: Docker + Docker Compose

---

## Week 1: Foundation & Core Setup (Days 1-5)

### ✅ Day 1: Project Initialization & Database Setup (COMPLETE)

**Files Created**:
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `server.js` - Express server entry point
- `src/config/database.js` - PostgreSQL configuration
- `src/models/` - 7 database models (User, Document, Invoice, Resume, Contract, Receipt, JobPosting)
- `src/migrations/` - 7 migration files
- `src/utils/logger.js` - Winston logger
- `src/utils/pagination.js` - Pagination utilities
- `src/utils/responses.js` - Standard response formatters
- `src/middleware/errorHandler.js` - Global error handling
- `docker-compose.yml` - PostgreSQL container setup
- `README.md` - Project documentation

**Database Schema**:
- ✅ Users table with authentication fields
- ✅ Documents table with file metadata
- ✅ Invoices table with JSONB fields
- ✅ Resumes table with job matching
- ✅ Contracts table with risk assessment
- ✅ Receipts table with expense tracking
- ✅ JobPostings table for resume matching

**Commit**: "Day 1: Project initialization and database setup"

---

### ✅ Day 2: Authentication System (COMPLETE)

**Files Created**:
- `src/config/jwt.js` - JWT token generation and verification
- `src/middleware/auth.js` - Authentication middleware with role-based authorization
- `src/middleware/validation.js` - Input validation rules
- `src/controllers/authController.js` - Auth endpoints (register, login, logout, me, refresh)
- `src/routes/auth.js` - Auth routes with validation

**Files Modified**:
- `server.js` - Mounted auth routes
- `.gitignore` - Excluded testing files

**API Endpoints**:
- ✅ POST /api/auth/register - User registration
- ✅ POST /api/auth/login - User login
- ✅ POST /api/auth/logout - User logout
- ✅ GET /api/auth/me - Get current user
- ✅ POST /api/auth/refresh - Refresh access token

**Features**:
- JWT access tokens (7 days expiry)
- Refresh tokens (30 days expiry)
- Password hashing with bcrypt (10 rounds)
- Role-based authorization (admin/user)
- Input validation (email, password strength)
- Protected routes middleware

**Commit**: "Day 2: Complete authentication system"

---

### 📋 Day 3: File Upload Infrastructure (NEXT)

**Files to Create**:
- `src/config/upload.js` - Multer configuration
- `src/middleware/upload.js` - File upload middleware
- `src/controllers/documentController.js` - Document CRUD operations
- `src/routes/documents.js` - Document routes
- `src/services/fileService.js` - File handling logic

**Features to Implement**:
- Multer configuration for multipart/form-data
- File type validation (PDF, DOCX, PNG, JPG)
- File size validation (10MB max)
- Unique filename generation with UUID
- File metadata extraction
- Upload directory management
- Download endpoint with authentication

**API Endpoints**:
- POST /api/upload - Upload document
- GET /api/documents - List documents (paginated)
- GET /api/documents/:id - Get document details
- GET /api/documents/:id/download - Download file
- DELETE /api/documents/:id - Delete document

**Validation**:
- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/png, image/jpeg
- Max file size: 10MB (10485760 bytes)
- Required fields: file, document_type

**Commit**: "Day 3: File upload and storage system"

---

### 📋 Day 4: Database Models - Part 1

**Files to Create**:
- Enhanced models already created in Day 1, focus on:
  - Model associations testing
  - Database indexes verification
  - CRUD operations for each model

**Tasks**:
- Test Invoice model with JSONB operations
- Test Resume model with job matching
- Test Contract model with risk scoring
- Test Receipt model with expense categorization
- Verify all foreign key constraints
- Test cascade deletes
- Add any missing indexes

**Commit**: "Day 4: Core database models"

---

### 📋 Day 5: Database Models - Part 2 & Basic CRUD

**Files to Create**:
- `src/controllers/invoiceController.js` - Basic CRUD
- `src/controllers/resumeController.js` - Basic CRUD
- `src/controllers/contractController.js` - Basic CRUD
- `src/controllers/receiptController.js` - Basic CRUD
- `src/routes/invoices.js` - Invoice routes
- `src/routes/resumes.js` - Resume routes
- `src/routes/contracts.js` - Contract routes
- `src/routes/receipts.js` - Receipt routes

**Features**:
- Pagination for all list endpoints
- Filtering by date, status, type
- Sorting by various fields
- Search functionality
- Proper error handling

**Commit**: "Day 5: Complete models and basic CRUD"

---

## Week 2: Webhook Integration & API Development (Days 6-10)

### 📋 Day 6: Webhook Infrastructure

**Files to Create**:
- `src/utils/crypto.js` - HMAC signature utilities
- `src/middleware/webhookVerify.js` - HMAC verification
- `src/controllers/webhookController.js` - Webhook handlers
- `src/routes/webhooks.js` - Webhook routes

**Features**:
- HMAC SHA-256 signature verification
- Timestamp validation (prevent replay attacks)
- Webhook payload logging
- Error handling for webhooks
- Webhook secret management

**Security**:
- Verify X-Webhook-Signature header
- Validate X-Webhook-Timestamp
- Reject old requests (>5 minutes)
- Log all webhook attempts

**Commit**: "Day 6: Webhook infrastructure and security"

---

### 📋 Day 7: Document Processing Webhooks

**API Endpoints**:
- POST /api/webhooks/document-uploaded
- POST /api/webhooks/invoice-processed
- POST /api/webhooks/resume-processed
- POST /api/webhooks/contract-analyzed
- POST /api/webhooks/receipt-processed

**Webhook Payload Structure**:
```json
{
  "document_id": "uuid",
  "document_type": "invoice|resume|contract|receipt",
  "processed_data": { ... },
  "validation": {
    "status": "valid|needs_review|invalid",
    "confidence_score": 0-100,
    "errors": []
  },
  "timestamp": "ISO 8601"
}
```

**Commit**: "Day 7: Document processing webhooks"

---

### 📋 Day 8: Invoice & Receipt APIs

**Invoice Endpoints**:
- GET /api/invoices - List with filters (vendor, date range, status)
- GET /api/invoices/:id - Get details
- PUT /api/invoices/:id - Update (manual corrections)
- GET /api/invoices/stats - Statistics (total, pending, avg amount)

**Receipt Endpoints**:
- GET /api/receipts - List with filters
- GET /api/receipts/:id - Get details
- GET /api/receipts/by-category - Group by expense category
- GET /api/receipts/monthly-report - Monthly expense report

**Commit**: "Day 8: Invoice and receipt APIs"

---

### 📋 Day 9: Resume & Job Posting APIs

**Files to Create**:
- `src/services/resumeService.js` - Resume matching logic
- `src/controllers/jobController.js` - Job CRUD
- `src/routes/jobs.js` - Job routes

**Resume Endpoints**:
- GET /api/resumes - List with filters
- GET /api/resumes/:id - Get details
- POST /api/resumes/:id/match-job - Match to job
- GET /api/resumes/top-candidates - Top scoring candidates

**Job Endpoints**:
- GET /api/jobs - List jobs
- POST /api/jobs - Create job
- GET /api/jobs/:id - Get job
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job

**Matching Algorithm**:
- Skills matching (required vs preferred)
- Experience level matching
- Location matching
- Scoring: 0-100 based on criteria
- Recommendation: strong_yes, yes, maybe, no, strong_no

**Commit**: "Day 9: Resume and job posting APIs"

---

### 📋 Day 10: Contract APIs & Document Management

**Contract Endpoints**:
- GET /api/contracts - List contracts
- GET /api/contracts/:id - Get details
- GET /api/contracts/expiring - Expiring in next 30 days
- GET /api/contracts/high-risk - Risk score > 70

**Enhanced Document Endpoints**:
- GET /api/documents - Enhanced with filters
- DELETE /api/documents/:id - Delete with cascade
- POST /api/documents/:id/reprocess - Trigger n8n reprocessing

**Commit**: "Day 10: Contract and document management APIs"

---

## Week 3: Analytics, Security & Deployment (Days 11-15)

### 📋 Day 11: Dashboard & Analytics APIs

**Files to Create**:
- `src/controllers/dashboardController.js` - Analytics endpoints
- `src/services/analyticsService.js` - Data aggregation
- `src/routes/dashboard.js` - Dashboard routes

**Endpoints**:
- GET /api/dashboard/overview - Total docs, by type, by status
- GET /api/dashboard/invoices-summary - Total amount, avg, trends
- GET /api/dashboard/resume-pipeline - Candidate funnel
- GET /api/dashboard/expense-trends - Monthly expense trends

**Commit**: "Day 11: Dashboard and analytics APIs"

---

### 📋 Day 12: Export & Settings Features

**Files to Create**:
- `src/services/exportService.js` - PDF/CSV generation
- `src/controllers/settingsController.js` - User settings
- `src/routes/settings.js` - Settings routes

**Export Endpoints**:
- GET /api/invoices/:id/export?format=pdf|csv
- GET /api/receipts/export?format=csv|excel

**Settings Endpoints**:
- GET /api/settings - Get user settings
- PUT /api/settings - Update settings

**Commit**: "Day 12: Export and settings features"

---

### 📋 Day 13: Security Hardening

**Files to Create**:
- `src/middleware/rateLimiter.js` - Rate limiting config
- Enhanced validation in existing files

**Security Features**:
- Rate limiting (different limits per endpoint type)
- Input sanitization (XSS prevention)
- SQL injection prevention (parameterized queries)
- CORS configuration
- Helmet security headers
- File virus scanning (optional - ClamAV)

**Rate Limits**:
- Auth endpoints: 5 requests/15min per IP
- File upload: 10 requests/hour per user
- General API: 100 requests/15min per user
- Webhooks: 1000 requests/hour

**Commit**: "Day 13: Security hardening"

---

### 📋 Day 14: Testing & Documentation

**Files to Create**:
- `tests/unit/auth.test.js` - Auth tests
- `tests/unit/fileUpload.test.js` - Upload tests
- `tests/integration/webhooks.test.js` - Webhook tests
- `tests/integration/api.test.js` - API tests
- `docs/swagger.yaml` - OpenAPI specification

**Testing**:
- Unit tests for services
- Integration tests for endpoints
- Test coverage > 70%
- Mock database for tests

**Documentation**:
- Swagger UI at /api-docs
- Complete API reference
- Request/response examples
- Authentication guide

**Commit**: "Day 14: Testing and documentation"

---

### 📋 Day 15: Docker, Deployment & Final Polish

**Files to Create**:
- `Dockerfile` - Multi-stage build
- Enhanced `docker-compose.yml` - API + PostgreSQL
- `src/seeders/` - Sample data seeders
- `DEPLOYMENT.md` - Deployment guide

**Features**:
- Production Dockerfile
- Docker Compose for full stack
- Database seeding scripts
- Environment-based configuration
- Production logging
- Health checks
- Final code cleanup

**Commit**: "Day 15: Docker setup and final polish"

---

## API Response Standards

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
      "totalPages": 5
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

---

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/docprocessing

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# n8n Webhooks
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_BASE_URL=https://your-n8n-instance.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

---

## Progress Tracking

| Week | Days | Status | Completion |
|------|------|--------|------------|
| Week 1 | 1-5 | In Progress | 40% (2/5) |
| Week 2 | 6-10 | Not Started | 0% |
| Week 3 | 11-15 | Not Started | 0% |

**Overall**: 13.3% (2/15 days)

---

## Next Steps

**Day 3 Focus**: File Upload Infrastructure
- Set up Multer for multipart file uploads
- Implement file validation (type, size)
- Create upload/download endpoints
- Test with various file types
- Update Postman collection

**Estimated Time**: 4-6 hours
