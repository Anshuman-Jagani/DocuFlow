# Implementation Plan: Intelligent Document Processing System

## Project Overview

**Repository**: https://github.com/Anshuman-Jagani/DocuFlow.git  
**Timeline**: 15 working days (3 weeks × 5 days)  
**Current Progress**: Day 5 Complete (33%) - Week 1 Complete ✅

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

### ✅ Day 3: File Upload Infrastructure (COMPLETE)

**Files Created**:
- ✅ `src/config/upload.js` - Multer configuration with disk storage
- ✅ `src/middleware/upload.js` - File upload middleware with error handling
- ✅ `src/controllers/documentController.js` - Document CRUD operations
- ✅ `src/routes/documents.js` - Document routes with authentication
- ✅ `src/services/fileService.js` - File handling utilities
- ✅ `postman/DocuFlow.postman_collection.json` - Updated with document endpoints

**Files Modified**:
- ✅ `server.js` - Mounted document routes
- ✅ `TASK_TRACKER.md` - Updated progress to 3/15 days

**Features Implemented**:
- ✅ Multer configuration for multipart/form-data
- ✅ File type validation (PDF, DOCX, PNG, JPEG)
- ✅ File size validation (10MB max)
- ✅ Unique filename generation with UUID + timestamp
- ✅ File metadata extraction
- ✅ Automatic upload directory creation
- ✅ Download endpoint with file streaming
- ✅ Delete endpoint (removes file + database record)

**API Endpoints**:
- ✅ POST /api/upload - Upload document
- ✅ GET /api/documents - List documents (paginated, filtered)
- ✅ GET /api/documents/:id - Get document details
- ✅ GET /api/documents/:id/download - Download file
- ✅ DELETE /api/documents/:id - Delete document

**Validation**:
- ✅ Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/png, image/jpeg
- ✅ Max file size: 10MB (10485760 bytes)
- ✅ Required fields: file, document_type
- ✅ Document type enum: invoice, resume, contract, receipt

**Testing**:
- ✅ All endpoints tested with curl
- ✅ File upload working
- ✅ File type validation working
- ✅ File size validation working
- ✅ Pagination and filtering working
- ✅ Download functionality working
- ✅ Delete functionality working

**Commit**: "Day 3: File upload and storage system" (df26081)

---

### ✅ Day 4: Database Models Testing (COMPLETE)

**Files Created**:
- ✅ `tests/unit/testHelpers.js` - Test utilities and factory functions
- ✅ `tests/unit/models.test.js` - Comprehensive model tests (29 tests)
- ✅ `scripts/verify-models.js` - Manual verification script

**Testing Coverage**:
- ✅ Invoice model JSONB operations (line_items, validation_errors)
- ✅ Resume model JSONB operations (skills, experience, education, match data)
- ✅ Contract model JSONB operations (parties, payment_terms, obligations, red_flags)
- ✅ Receipt model JSONB operations (items)
- ✅ JobPosting model and associations
- ✅ Foreign key constraints verification
- ✅ Cascade delete testing (User → Documents → Related models)
- ✅ SET NULL testing (JobPosting → Resume)
- ✅ Data validation (score ranges, enums)
- ✅ Default values for JSONB fields

**Test Results**:
- ✅ All 48 tests passing (added User model tests)
- ✅ 89.9% code coverage
- ✅ All models verified with JSONB operations
- ✅ All associations working correctly
- ✅ Cascade deletes functioning as expected

**Commits**: 
- "Day 4: Core database models testing" (1e00b89)
- "Improve test coverage to 89.9% with 100% model coverage" (ecf2b2d)

---

### ✅ Day 5: Database Models - Part 2 & Basic CRUD (COMPLETE)

**Files Created**:
- ✅ `src/utils/queryHelpers.js` (185 lines) - Advanced query building utilities
- ✅ `src/controllers/invoiceController.js` (188 lines) - Invoice CRUD + statistics
- ✅ `src/controllers/resumeController.js` (308 lines) - Resume CRUD + job matching algorithm
- ✅ `src/controllers/contractController.js` (217 lines) - Contract CRUD + expiring/high-risk endpoints
- ✅ `src/controllers/receiptController.js` (249 lines) - Receipt CRUD + category grouping + monthly reports
- ✅ `src/routes/invoices.js` (47 lines) - Invoice routes with authentication
- ✅ `src/routes/resumes.js` (51 lines) - Resume routes with job matching
- ✅ `src/routes/contracts.js` (57 lines) - Contract routes with special endpoints
- ✅ `src/routes/receipts.js` (59 lines) - Receipt routes with analytics

**Files Modified**:
- ✅ `server.js` - Mounted 4 new route handlers
- ✅ `TASK_TRACKER.md` - Updated to Day 5 complete

**API Endpoints Created** (22 new endpoints):

**Invoice Endpoints (5)**:
- ✅ GET /api/invoices - List with pagination, filtering (status, vendor, date range)
- ✅ GET /api/invoices/:id - Get single invoice with document details
- ✅ PUT /api/invoices/:id - Update invoice fields
- ✅ DELETE /api/invoices/:id - Delete invoice
- ✅ GET /api/invoices/stats - Statistics (total amount, count by status, by currency)

**Resume Endpoints (5)**:
- ✅ GET /api/resumes - List with pagination, filtering (name, email, experience)
- ✅ GET /api/resumes/:id - Get single resume with job matching data
- ✅ PUT /api/resumes/:id - Update resume fields
- ✅ DELETE /api/resumes/:id - Delete resume
- ✅ POST /api/resumes/:id/match-job - Match resume with job (weighted scoring algorithm)

**Contract Endpoints (6)**:
- ✅ GET /api/contracts - List with pagination, filtering (type, status, risk score, date)
- ✅ GET /api/contracts/:id - Get single contract
- ✅ PUT /api/contracts/:id - Update contract
- ✅ DELETE /api/contracts/:id - Delete contract
- ✅ GET /api/contracts/expiring - Get contracts expiring soon (with days until expiration)
- ✅ GET /api/contracts/high-risk - Get high-risk contracts (configurable threshold)

**Receipt Endpoints (6)**:
- ✅ GET /api/receipts - List with pagination, filtering (category, merchant, business expense, date)
- ✅ GET /api/receipts/:id - Get single receipt
- ✅ PUT /api/receipts/:id - Update receipt
- ✅ DELETE /api/receipts/:id - Delete receipt
- ✅ GET /api/receipts/by-category - Group receipts by expense category with totals
- ✅ GET /api/receipts/monthly-report - Generate monthly expense report

**Features Implemented**:
- ✅ Query helpers utility with date range, search, JSONB, status, and numeric filtering
- ✅ Pagination across all endpoints (page, limit, offset)
- ✅ Pagination metadata (total, totalPages, hasNext, hasPrev)
- ✅ Flexible sorting (sort_by, sort_order)
- ✅ User-scoped data access (all queries filtered by user_id)
- ✅ Job matching algorithm (60% skills, 20% preferred, 20% experience)
- ✅ Invoice statistics and analytics
- ✅ Contract expiration tracking
- ✅ Receipt category grouping and monthly reports
- ✅ Standardized error handling and responses

**Testing**:
- ✅ All 48 existing tests passing
- ✅ No regressions introduced
- ✅ Code coverage: 89.9% maintained
- ✅ Server running successfully with all routes mounted

**Commits**: 
- "Day 5: Complete models and basic CRUD" (0474d30)
- "Update PROJECT_REPORT.md with Day 5 comprehensive report" (70b02b0)

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
| Week 1 | 1-5 | ✅ Complete | 100% (5/5) |
| Week 2 | 6-10 | Not Started | 0% |
| Week 3 | 11-15 | Not Started | 0% |

**Overall**: 33% (5/15 days)  
**Week 1**: ✅ COMPLETE - All CRUD endpoints implemented (32 total endpoints)

---

## Next Steps

**Day 6 Focus**: Webhook Infrastructure
- Create webhook verification middleware (HMAC)
- Implement webhook logging system
- Build webhook base controller
- Set up webhook routes structure
- Add webhook secret management
- Create webhook payload validators
- Test webhook security

**Estimated Time**: 4-6 hours
