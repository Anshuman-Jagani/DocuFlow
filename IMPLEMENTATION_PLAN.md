# Implementation Plan: Intelligent Document Processing System

## Project Overview

**Repository**: https://github.com/Anshuman-Jagani/DocuFlow.git  
**Timeline**: 10 working days (2 weeks × 5 days) - **ACCELERATED SCHEDULE**  
**Current Progress**: Day 9 Complete (90%) - Week 2 Progressing ✅  
**Week 2 Deadline**: February 6, 2026 (Friday) - Backend completion required

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

## Week 2: ACCELERATED BACKEND COMPLETION (Days 6-10)

> [!IMPORTANT]
> **Critical Deadline**: All backend development must be completed by February 6, 2026 (Friday)
> 
> This week consolidates the original 10 remaining days into 5 intensive development days. Each day will cover multiple components to meet the deadline.

---

### ✅ Day 6: Webhook Infrastructure + Document Processing (Monday, Feb 3) - COMPLETE

**Priority**: HIGH - Foundation for n8n integration

**Files to Create**:
- `src/utils/crypto.js` - HMAC signature utilities
- `src/middleware/webhookVerify.js` - HMAC verification
- `src/controllers/webhookController.js` - Webhook handlers
- `src/routes/webhooks.js` - Webhook routes

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

**Security Features**:
- HMAC SHA-256 signature verification
- Timestamp validation (prevent replay attacks)
- Webhook payload logging
- Verify X-Webhook-Signature header
- Validate X-Webhook-Timestamp
- Reject old requests (>5 minutes)

**Testing**:
- Create `tests/integration/webhooks.test.js`
- Test signature verification
- Test replay attack prevention
- Test all webhook endpoints

**Estimated Time**: 6-8 hours

**Commit**: "Day 6: Webhook infrastructure and document processing webhooks"

---

### ✅ Day 7: Job Posting APIs + Resume Matching Enhancement (Tuesday, Feb 4) - COMPLETE

**Priority**: HIGH - Complete resume/job functionality

**Files to Create**:
- `src/services/resumeService.js` - Enhanced resume matching logic
- `src/controllers/jobController.js` - Job CRUD operations
- `src/routes/jobs.js` - Job posting routes
- `tests/unit/resumeService.test.js` - Resume matching tests

**Job Posting Endpoints** (5 new):
- GET /api/jobs - List jobs with filters
- POST /api/jobs - Create job posting
- GET /api/jobs/:id - Get job details
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job

**Enhanced Resume Endpoints**:
- GET /api/resumes/top-candidates - Top scoring candidates across all jobs
- POST /api/resumes/batch-match - Match multiple resumes to a job

**Matching Algorithm Enhancement**:
- Skills matching (required vs preferred)
- Experience level matching (junior/mid/senior)
- Location matching with remote options
- Scoring: 0-100 based on weighted criteria
  - Required skills: 40%
  - Preferred skills: 20%
  - Experience level: 20%
  - Education: 10%
  - Location: 10%
- Recommendation levels: strong_yes (>80), yes (60-80), maybe (40-60), no (<40)

**Files Modified**:
- `server.js` - Mount job routes
- `src/controllers/resumeController.js` - Add batch matching endpoint

**Testing**:
- Test job CRUD operations
- Test matching algorithm accuracy
- Test edge cases (no skills, overqualified, etc.)

**Estimated Time**: 6-8 hours

**Commit**: "Day 7: Job posting APIs and enhanced resume matching"

---

### ✅ Day 8: Dashboard Analytics + Financial APIs (Wednesday, Feb 5) - COMPLETE

**Priority**: HIGH - Business intelligence and system stability

**Files Created**:
- ✅ `src/controllers/dashboardController.js` - Comprehensive analytics endpoints
- ✅ `src/routes/dashboard.js` - Dashboard overview routes

**Files Modified**:
- ✅ `src/models/Invoice.js` - Added `status` field for financial tracking
- ✅ `src/routes/webhooks.js` - Removed signature verification for n8n ease-of-use
- ✅ `tests/unit/testHelpers.js` - Added authentication and document creation helpers
- ✅ `tests/integration/dashboard.test.js` - Refactored for 100% pass rate
- ✅ `postman/DocuFlow.postman_collection.json` - Simplified webhook requests

**Analytics Features Implemented**:
- ✅ **Dashboard Overview**: Total documents, breakdown by type, processing status
- ✅ **Financial Summary**: Invoice totals, status distribution, receipt category analysis
- ✅ **Trend Analysis**: 7-day and 30-day upload trends, volume over time
- ✅ **Activity Tracking**: Real-time recent activity feed with accurate timestamps

**System Improvements**:
- ✅ **Testing Excellence**: Achieved 11/11 passing tests for Dashboard (100%)
- ✅ **Code Coverage**: 85.26% coverage for the dashboard controller
- ✅ **Security Simplification**: Removed HMAC requirements from webhooks as per user request
- ✅ **Data Integrity**: Forced proper ISO date serialization for JSON responses

**Commit**: "Day 8: Analytics and financial APIs & Fix all dashboard integration tests (11/11 passing)"

---

### ✅ Day 9: Export Features & Security Hardening (COMPLETE)

**Status**: ✅ COMPLETE  
**Date**: February 5, 2026

**Files Created**:
- `src/services/exportService.js` - CSV/PDF generation service (281 lines)
- `src/middleware/rateLimiter.js` - Rate limiting configurations (97 lines)
- `src/middleware/sanitization.js` - Input sanitization middleware (139 lines)
- `tests/integration/export.test.js` - Export endpoint tests (248 lines, 17 tests)

**Files Modified**:
- `src/controllers/invoiceController.js` - Added exportInvoicesCSV, exportInvoicePDF
- `src/controllers/receiptController.js` - Added exportReceiptsCSV, exportReceiptPDF
- `src/routes/invoices.js` - Added export routes
- `src/routes/receipts.js` - Added export routes
- `server.js` - Applied rate limiters to all routes
- `postman/DocuFlow.postman_collection.json` - Added 4 export endpoints

**API Endpoints Created** (4 new):
- ✅ GET /api/invoices/export/csv - Export invoices to CSV with filtering
- ✅ GET /api/invoices/:id/export/pdf - Export single invoice as PDF
- ✅ GET /api/receipts/export/csv - Export receipts to CSV with filtering
- ✅ GET /api/receipts/:id/export/pdf - Export single receipt as PDF

**Export Features Implemented**:
- ✅ CSV export using `json2csv` library
- ✅ PDF export using `pdfkit` library
- ✅ Formatted invoices with line items, tax details, payment terms
- ✅ Formatted receipts with items, merchant details, expense categories
- ✅ Support for filtering before export (status, date range, category)
- ✅ Proper file download headers and MIME types
- ✅ User-scoped data access (only export own documents)

**Security Features Implemented**:
- ✅ **Rate Limiting** (4 configurations):
  - Auth endpoints: 5 requests/15 minutes per IP
  - File upload: 10 requests/hour per user
  - General API: 100 requests/15 minutes per user
  - Webhooks: 1000 requests/hour
- ✅ **Input Sanitization**: XSS prevention using express-validator
  - Email normalization and validation
  - HTML escaping for text inputs
  - Validation rules for all entity types
  - Query parameter sanitization
- ✅ **Security Audit Completed**:
  - SQL injection protection (Sequelize ORM)
  - XSS protection (input sanitization)
  - Authentication on all routes
  - User-based authorization
  - CORS configuration
  - Helmet security headers

**Testing Results**:
- ✅ 17 new integration tests (all passing)
- ✅ Total: 90 tests (73 existing + 17 new)
- ✅ 100% pass rate
- ✅ No regressions introduced
- ✅ Test execution time: ~13 seconds

**Documentation Updated**:
- ✅ Postman collection (4 new endpoints)
- ✅ PROJECT_REPORT.md (comprehensive Day 9 section)
- ✅ TASK_TRACKER.md (90% progress)

**Estimated Time**: 4-5 hours (actual)

**Commit**: "Day 9: Export features, security hardening & comprehensive testing"

---

### 📋 Day 10: Documentation + Docker + Final Polish (Friday, Feb 7)

**Priority**: CRITICAL - Deployment readiness

**Files to Create**:
- `docs/swagger.yaml` - Complete OpenAPI 3.0 specification
- `Dockerfile` - Multi-stage production build
- `docker-compose.prod.yml` - Production stack (API + PostgreSQL)
- `src/seeders/demo-data.js` - Sample data seeder
- `DEPLOYMENT.md` - Deployment guide
- `API_REFERENCE.md` - Quick API reference
- `.dockerignore` - Docker build optimization
- `scripts/setup.sh` - Initial setup script
- `scripts/health-check.js` - Health check endpoint

**Documentation**:
- **Swagger/OpenAPI**:
  - Complete API specification
  - All 40+ endpoints documented
  - Request/response schemas
  - Authentication flows
  - Error codes reference
  - Serve at /api-docs with Swagger UI
- **API Reference**: Markdown quick reference
- **Deployment Guide**: Step-by-step deployment instructions
- **README.md**: Update with complete setup instructions

**Docker Setup**:
- **Dockerfile**:
  - Multi-stage build (builder + production)
  - Node.js 18 Alpine base
  - Optimized layer caching
  - Non-root user
  - Health checks
- **docker-compose.prod.yml**:
  - API service with restart policy
  - PostgreSQL with persistent volume
  - Environment variable management
  - Network isolation
  - Health checks for both services

**Seeder Data**:
- 5 sample users (1 admin, 4 regular)
- 20 sample documents across all types
- 10 invoices with various statuses
- 8 resumes with different skill sets
- 5 job postings for matching
- 6 contracts with different risk levels
- 10 receipts across categories

**Final Polish**:
- Code cleanup and formatting
- Remove console.logs, add proper logging
- Optimize database queries
- Add database indexes for performance
- Environment-based configuration
- Production logging with Winston
- Error tracking setup
- API versioning (v1 prefix)

**Health Check Endpoint**:
- GET /health - System health status
- GET /api/v1/health - API health with DB connection check

**Files Modified**:
- `server.js` - Add Swagger UI, health checks, API versioning
- `package.json` - Add documentation dependencies
- `README.md` - Complete documentation
- All route files - Add OpenAPI comments

**Testing**:
- Docker build verification
- Docker Compose stack test
- Seeder execution test
- Health check validation
- Full API smoke test

**Estimated Time**: 8-10 hours

**Commit**: "Day 10: Complete documentation, Docker setup, and final polish"

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
| Week 2 | 6-10 | 🔄 In Progress | 80% (4/5) |

**Overall**: 90% (9/10 days)  
**Week 1**: ✅ COMPLETE - All CRUD endpoints implemented (32 total endpoints)  
**Week 2**: 🚀 ACCELERATED SPRINT - Days 6, 7, 8 & 9 COMPLETE ✅

---

**Day 10 Focus**: Docker Setup & Final Polish (Friday, Feb 7)
- Create production Dockerfile (multi-stage build)
- Configure Docker Compose for production deployment
- Complete Swagger/OpenAPI documentation
- Final end-to-end integration testing
- Code cleanup and optimization
- Final commit and project completion

**Estimated Time**: 8-10 hours

> [!NOTE]
> **Day 9 Complete**: Export features (CSV/PDF), security hardening (rate limiting, input sanitization), and comprehensive testing (90 tests passing) successfully implemented. Project is 90% complete with only Docker setup and final polish remaining.
