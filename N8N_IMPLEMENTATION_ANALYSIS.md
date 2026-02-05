# DOCUFLOW N8N INTEGRATION - IMPLEMENTATION DETAILS

**Generated:** 2026-02-05  
**Analyzed Codebase:** DocuFlow Backend v1.0.0  
**Analysis Type:** Complete Code Examination

---

## 1. FILE TRANSFER METHOD TO N8N

**Method Used:** NONE - No automatic file transfer to n8n is implemented

**Implementation Status:** ❌ **NOT IMPLEMENTED**

**Actual Code:**
```javascript
// NO CODE FOUND
// The backend does NOT automatically trigger n8n webhooks after file upload
// There is no axios, fetch, or HTTP client code that sends files to n8n
```

**What IS Implemented:**
The backend only:
1. Accepts file uploads via `POST /api/upload`
2. Stores files locally in `./uploads/documents/`
3. Creates database records (Document + specialized table)
4. Returns success response to client

**What is NOT Implemented:**
- No HTTP client (axios, node-fetch, etc.) found in dependencies
- No code that triggers n8n webhooks after upload
- No file transfer mechanism (path, base64, or multipart) to n8n

**Expected Integration Pattern:**
Based on the webhook architecture, the intended flow is:

```
OPTION 1: n8n Polls Backend (RECOMMENDED)
┌─────────┐      ┌─────────┐      ┌─────────┐
│  User   │─────▶│ Backend │      │   n8n   │
│ Upload  │      │  Saves  │◀─────│  Polls  │
└─────────┘      └─────────┘      └─────────┘
                      │                 │
                      │                 ▼
                      │           Process File
                      │                 │
                      │◀────────────────┘
                      │   POST /webhooks/
                      │   invoice-processed
```

**n8n Webhook URLs (Receiving from n8n):**
- Document Upload Notification: `POST http://backend:3001/api/webhooks/document-uploaded`
- Invoice Processed: `POST http://backend:3001/api/webhooks/invoice-processed`
- Resume Processed: `POST http://backend:3001/api/webhooks/resume-processed`
- Contract Analyzed: `POST http://backend:3001/api/webhooks/contract-analyzed`
- Receipt Processed: `POST http://backend:3001/api/webhooks/receipt-processed`

**Payload Structure Received FROM n8n:**
```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "processed_data": {
    "invoice_number": "INV-2024-001",
    "vendor_name": "Acme Corp",
    "total_amount": 1500.00,
    "currency": "USD",
    "issue_date": "2024-01-15",
    "due_date": "2024-02-15",
    "line_items": [...]
  },
  "validation": {
    "status": "valid",
    "confidence_score": 95,
    "errors": []
  },
  "timestamp": "2026-02-05T12:05:00.000Z"
}
```

**Notes:** 
- Backend is designed to RECEIVE webhooks from n8n, not SEND to n8n
- n8n must poll `GET /api/documents?processing_status=pending` to find new uploads
- Or use database triggers/polling to detect new documents

---

## 2. SHARED VOLUME CONFIGURATION

**Answer:** NO (in current docker-compose.yml)

**Docker Compose Configuration:**
```yaml
# Current docker-compose.yml
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

  # API container is COMMENTED OUT
  # api:
  #   build: .
  #   container_name: docuflow-api
  #   ...

volumes:
  postgres_data:
    driver: local

# NO n8n SERVICE DEFINED
# NO SHARED VOLUMES FOR FILE ACCESS
```

**Volume Details:**
- **Backend API Mount Path:** Not applicable (API not containerized in current setup)
- **n8n Mount Path:** Not configured (n8n service not defined)
- **Host Path:** `./uploads` (local filesystem only)

**File Access:** NO - n8n cannot access backend files directly

**Current Setup:**
- Backend runs on host machine (not in Docker)
- Only PostgreSQL runs in Docker
- Files stored at `./uploads/documents/` on host filesystem

**Required Configuration for Shared Volume Access:**
```yaml
# RECOMMENDED docker-compose.yml
version: '3.8'

services:
  postgres:
    # ... existing config ...

  api:
    build: .
    container_name: docuflow-api
    volumes:
      - ./uploads:/app/uploads  # ← Backend mount
    networks:
      - docuflow-network

  n8n:
    image: n8nio/n8n:latest
    container_name: docuflow-n8n
    volumes:
      - ./uploads:/app/uploads  # ← n8n mount (SAME PATH)
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

**Notes:** 
- Current setup does NOT support file path method
- To use file paths, must add shared volume configuration
- Alternative: Use HTTP download method (n8n calls `/api/documents/:id/download`)

---

## 3. OCR SERVICE FOR IMAGE PROCESSING

**Service Configured:** None

**Status:** ❌ **NOT IMPLEMENTED**

**Environment Variables:**
```bash
# No OCR environment variables found in .env or .env.example
# The following are commented out placeholders only:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

**Implementation Code:**
```javascript
// NOT IMPLEMENTED IN BACKEND
// No OCR-related code found in:
// - src/services/
// - src/controllers/
// - src/utils/
```

**Package Dependencies:**
```json
// From package.json - NO OCR packages found
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "json2csv": "^6.0.0-alpha.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1",  // ← PDF text extraction only
    "pdfkit": "^0.17.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.35.2",
    "sharp": "^0.33.2",  // ← Image manipulation, NOT OCR
    "uuid": "^9.0.1",
    "winston": "^3.11.0"
  }
}
```

**Supported Image Types:** PNG, JPG, JPEG (upload only, no OCR processing)

**File Type Validation (from src/config/upload.js):**
```javascript
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg'
];
```

**Notes:** 
- Backend accepts PNG/JPG uploads but does NOT process them
- OCR must be implemented in n8n workflows
- Recommended n8n OCR options:
  1. **Tesseract OCR** (free, open-source)
  2. **Google Cloud Vision API** (paid, high accuracy)
  3. **OCR.space API** (free tier available)

---

## 4. EMAIL SERVICE CONFIGURATION

**Service Configured:** None

**Status:** ❌ **NOT IMPLEMENTED**

**Environment Variables:**
```bash
# From .env - Email variables are COMMENTED OUT (not active)
# Optional: Email Notifications
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

**Implementation Code:**
```javascript
// NOT IMPLEMENTED IN BACKEND
// No email service code found
// Searched for: nodemailer, sendgrid, ses, smtp
// Result: No matches in src/ directory
```

**Package Dependencies:**
```json
// From package.json - NO email packages found
// No nodemailer, @sendgrid/mail, aws-sdk, or similar
```

**Email Triggers:**
- Invoice processing: Not defined
- Resume screening: Not defined
- Contract analysis: Not defined
- Receipt processing: Not defined

**From Address:** Not configured

**Notes:** 
- Email notifications are planned but not implemented
- Must be implemented in n8n workflows if needed
- Recommended n8n email options:
  1. **Gmail OAuth2** (via n8n Gmail node)
  2. **SMTP** (via n8n Email Send node)
  3. **SendGrid** (via n8n SendGrid node)

---

## 5. LLM SERVICE AND MODELS

**Service Configured:** None

**Status:** ❌ **NOT IMPLEMENTED IN BACKEND**

**Environment Variables:**
```bash
# No LLM environment variables found in .env or .env.example
# No OPENAI_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, etc.
```

**API Configuration:**
- **Base URL:** Not configured
- **Models Used:** None in backend
- **Temperature:** Not configured
- **Max Tokens:** Not configured

**Implementation Code:**
```javascript
// LLM PROCESSING HANDLED ENTIRELY BY N8N
// No AI/LLM code in backend
// Backend only stores processed results from n8n
```

**Package Dependencies:**
```json
// From package.json - NO LLM packages found
// No openai, @anthropic-ai/sdk, or similar packages
```

**Usage Location:** n8n only (expected)

**Backend's Role:**
1. Accept file uploads
2. Store files and metadata
3. Receive processed results from n8n via webhooks
4. Update database with extracted data

**n8n's Role (expected):**
1. Poll for pending documents
2. Download/access files
3. Perform OCR (if needed)
4. Call LLM APIs for data extraction
5. Validate extracted data
6. Send results back to backend via webhooks

**Recommended n8n LLM Configuration:**
```javascript
// n8n OpenAI Node Configuration
{
  "resource": "chat",
  "model": "gpt-4-turbo-preview",
  "messages": [
    {
      "role": "system",
      "content": "Extract invoice data as JSON..."
    },
    {
      "role": "user",
      "content": "{{$json.extracted_text}}"
    }
  ],
  "options": {
    "temperature": 0.1,
    "maxTokens": 2000
  }
}
```

**Notes:** 
- Backend is designed to be AI-agnostic
- All AI processing happens in n8n
- This is the correct architecture for flexibility

---

## 6. ADDITIONAL FINDINGS

**Supported File Types:**
- PDF: ✅ YES (`application/pdf`)
- PNG: ✅ YES (`image/png`)
- JPG/JPEG: ✅ YES (`image/jpeg`)
- DOCX: ✅ YES (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- DOC: ❌ NO (old .doc format not supported)
- Other: None

**File Size Limits:**
- Maximum: 10MB (10,485,760 bytes)
- Validation: Multer middleware in `src/config/upload.js`

**File Type Validation:**
```javascript
// src/config/upload.js
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: PDF, DOCX, PNG, JPEG. Received: ${file.mimetype}`), false);
  }
};
```

**Webhook Authentication:**
- Method: None (signature verification removed for testing)
- Header Name: Previously `X-Webhook-Signature` and `X-Webhook-Timestamp`
- Validation Code:
```javascript
// src/utils/crypto.js - EXISTS but NOT USED
/**
 * Generate HMAC SHA-256 signature for webhook payload
 */
const generateSignature = (payload, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
};

// NOTE: Signature verification middleware exists but is NOT applied to routes
// From PROJECT_REPORT.md: "Security checks - signature and timestamp - removed for manual testing ease"
```

**Rate Limiting:**
- Configured: ✅ YES
- Limits:
  - Auth endpoints: 5 requests per 15 minutes
  - File upload: 10 requests per 1 hour
  - General API: 100 requests per 15 minutes
  - Webhooks: 1000 requests per 1 hour

**Rate Limiter Code:**
```javascript
// src/middleware/rateLimiter.js
exports.webhookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per window
  message: {
    success: false,
    error: {
      code: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
      message: 'Webhook rate limit exceeded. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});
```

---

## 7. CRITICAL PATHS AND REFERENCES

**Key Files Examined:**

✅ **`src/routes/documents.js`** - Found
- Handles file upload endpoint `POST /api/upload`
- Uses authentication, upload middleware, validation
- No n8n triggering code

✅ **`src/routes/webhooks.js`** - Found
- Defines 5 webhook endpoints for receiving data FROM n8n
- No outgoing webhook triggers

✅ **`src/controllers/documentController.js`** - Found
- `uploadDocument()` function creates Document + specialized records
- No HTTP calls to external services
- No n8n integration

✅ **`src/controllers/webhookController.js`** - Found
- 5 webhook handlers: documentUploaded, invoiceProcessed, resumeProcessed, contractAnalyzed, receiptProcessed
- All receive data FROM n8n and update database
- No outgoing requests

✅ **`src/config/database.js`** - Found
- PostgreSQL configuration via Sequelize
- Connection string from environment variables

✅ **`docker-compose.yml`** - Found
- Only PostgreSQL service defined
- API and n8n services commented out
- No shared volumes configured

✅ **`.env.example`** - Found
- Template for environment variables
- Email and some features commented out

✅ **`package.json`** - Found
- All dependencies examined
- No HTTP client, OCR, email, or LLM packages

**Missing or Incomplete Components:**

1. **n8n Trigger Mechanism**
   - ❌ No code to notify n8n of new uploads
   - ✅ Solution: n8n must poll `GET /api/documents?processing_status=pending`

2. **OCR Processing**
   - ❌ Not implemented in backend
   - ✅ Solution: Implement in n8n workflows

3. **Email Notifications**
   - ❌ Not implemented
   - ✅ Solution: Implement in n8n workflows

4. **LLM Integration**
   - ❌ Not implemented in backend (by design)
   - ✅ Solution: Implement in n8n workflows

5. **Webhook Security**
   - ⚠️ Implemented but disabled
   - ✅ Solution: Re-enable for production

6. **Docker Containerization**
   - ⚠️ Partially configured (only PostgreSQL)
   - ✅ Solution: Uncomment and configure API and n8n services

---

## 8. RECOMMENDED N8N WORKFLOW CONFIGURATION

Based on the analysis above, here are the recommended n8n workflow settings:

### File Input Method

**Recommended: HTTP Download Method**

Since shared volumes are not configured, use:

```javascript
// n8n HTTP Request Node
{
  "method": "GET",
  "url": "http://localhost:3001/api/documents/{{$json.id}}/download",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "httpHeaderAuth",
  "headerParameters": {
    "parameters": [
      {
        "name": "Authorization",
        "value": "Bearer {{$credentials.backendApiToken}}"
      }
    ]
  },
  "responseFormat": "file"
}
```

### Database Connection

- **Host:** `localhost` (if n8n on host) or `postgres` (if n8n in Docker network)
- **Port:** `5432`
- **Database:** `docprocessing`
- **User:** `postgres`
- **Password:** `password` (from .env)
- **Connection from n8n:** ✅ Possible (PostgreSQL exposed on port 5432)

### Required n8n Credentials

1. **PostgreSQL:** ✅ Required for polling documents
   - Host: `localhost` or `postgres`
   - Port: `5432`
   - Database: `docprocessing`
   - User: `postgres`
   - Password: `password`

2. **Backend API Auth:** ✅ Required for file downloads
   - Type: HTTP Header Auth
   - Header Name: `Authorization`
   - Header Value: `Bearer <JWT_TOKEN>`
   - Get token via: `POST /api/auth/login`

3. **OpenAI/LLM API:** ✅ Required (configure in n8n)
   - Service: OpenAI, OpenRouter, or Anthropic
   - API Key: Your key
   - Model: gpt-4, llama-3.1-70b, claude-3-opus, etc.

4. **OCR Service:** ✅ Required for images
   - Option 1: Tesseract (free, local)
   - Option 2: Google Cloud Vision (paid)
   - Option 3: OCR.space (free tier)

5. **Email Service:** Optional
   - Gmail OAuth2, SMTP, or SendGrid

### Workflow Trigger Type

**Recommended: Schedule Trigger (Polling)**

```javascript
// n8n Schedule Trigger Node
{
  "rule": {
    "interval": [
      {
        "field": "minutes",
        "minutesInterval": 5  // Poll every 5 minutes
      }
    ]
  }
}
```

**Alternative: Database Trigger**

```sql
-- PostgreSQL trigger to notify n8n (advanced)
CREATE OR REPLACE FUNCTION notify_new_document()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_document', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_insert_trigger
AFTER INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION notify_new_document();
```

### Complete n8n Workflow Structure

```
1. Schedule Trigger (every 5 minutes)
   ↓
2. PostgreSQL Query: SELECT * FROM documents WHERE processing_status = 'pending'
   ↓
3. Split Into Batches (process one at a time)
   ↓
4. HTTP Request: Download file from /api/documents/:id/download
   ↓
5. IF file is image (PNG/JPG):
   → OCR Node (Tesseract/Google Vision)
   ELSE:
   → PDF Parse Node
   ↓
6. OpenAI Node: Extract structured data
   ↓
7. Code Node: Validate extracted data
   ↓
8. HTTP Request: POST to /api/webhooks/{type}-processed
   ↓
9. PostgreSQL Update: Set processing_status = 'completed'
```

---

## 9. GAPS AND RECOMMENDATIONS

### Implementation Gaps

1. **No Automatic n8n Triggering**
   - Gap: Backend doesn't notify n8n of new uploads
   - Impact: n8n must poll database or API
   - Recommendation: Implement polling in n8n (every 1-5 minutes)

2. **No OCR Service**
   - Gap: Image files (PNG/JPG) cannot be processed
   - Impact: Images uploaded but not analyzed
   - Recommendation: Add Tesseract or Google Vision in n8n

3. **No Email Notifications**
   - Gap: Users don't get notified of processing results
   - Impact: Must manually check dashboard
   - Recommendation: Add email nodes in n8n workflows

4. **No LLM Integration**
   - Gap: No AI processing in backend
   - Impact: Relies entirely on n8n
   - Recommendation: Configure OpenAI/OpenRouter in n8n (correct approach)

5. **Webhook Security Disabled**
   - Gap: No signature verification on webhooks
   - Impact: Vulnerable to unauthorized webhook calls
   - Recommendation: Re-enable HMAC verification for production

6. **No Shared Docker Volumes**
   - Gap: n8n can't access files via file path
   - Impact: Must use HTTP download (slower)
   - Recommendation: Configure shared volumes in docker-compose.yml

### Security Concerns

1. **Webhook Endpoints Unprotected**
   - Issue: Anyone can POST to `/api/webhooks/*`
   - Risk: Data manipulation, DoS attacks
   - Fix: Re-enable signature verification or add API key auth

2. **No Request Size Limits on Webhooks**
   - Issue: Large payloads could cause memory issues
   - Risk: DoS via large JSON payloads
   - Fix: Add body size limits in Express

3. **Database Credentials in Plain Text**
   - Issue: `.env` file contains passwords
   - Risk: Exposure if file leaked
   - Fix: Use secrets management (Docker secrets, AWS Secrets Manager)

4. **CORS Allows Multiple Origins**
   - Issue: `ALLOWED_ORIGINS` includes multiple localhost ports
   - Risk: Potential CSRF if misconfigured
   - Fix: Restrict to production domains only

### Performance Considerations

1. **File Size Limit (10MB)**
   - Concern: Large PDFs may timeout during OCR/LLM processing
   - Recommendation: Set n8n workflow timeout to 5+ minutes

2. **No File Cleanup**
   - Concern: Uploaded files never deleted (disk space grows)
   - Recommendation: Add cleanup job for processed files older than 30 days

3. **No Caching**
   - Concern: Repeated API calls for same data
   - Recommendation: Add Redis caching for frequently accessed data

4. **Sequential Processing**
   - Concern: n8n processes one document at a time
   - Recommendation: Use n8n's batch processing (5-10 concurrent)

### Recommendations for n8n Integration

1. **Use PostgreSQL Polling** (Most Reliable)
   ```javascript
   // n8n PostgreSQL Node
   SELECT id, document_type, file_path, original_filename
   FROM documents
   WHERE processing_status = 'pending'
   ORDER BY upload_date ASC
   LIMIT 10;
   ```

2. **Implement Error Handling**
   ```javascript
   // n8n Error Trigger Node
   IF processing fails:
     - Update document.processing_status = 'failed'
     - Log error to database
     - Send admin notification
   ```

3. **Add Retry Logic**
   ```javascript
   // n8n HTTP Request Node Settings
   {
     "retries": 3,
     "retryDelay": 5000,
     "retryOn": [500, 502, 503, 504]
   }
   ```

4. **Optimize LLM Prompts**
   ```javascript
   // Use structured output format
   {
     "model": "gpt-4-turbo-preview",
     "response_format": { "type": "json_object" },
     "temperature": 0.1  // Low temperature for consistency
   }
   ```

5. **Monitor Processing Status**
   ```sql
   -- Add monitoring query
   SELECT 
     processing_status,
     COUNT(*) as count,
     AVG(EXTRACT(EPOCH FROM (processed_at - upload_date))) as avg_processing_time
   FROM documents
   GROUP BY processing_status;
   ```

6. **Implement Idempotency**
   ```javascript
   // Check if already processed before starting
   IF document.processing_status IN ('completed', 'processing'):
     SKIP
   ELSE:
     SET processing_status = 'processing'
     PROCESS
   ```

---

## 10. QUICK START GUIDE FOR N8N SETUP

### Step 1: Start Services

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Start backend (on host)
npm run dev

# Start n8n (on host or Docker)
npx n8n
# OR
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Step 2: Create Backend User

```bash
# Register user and get JWT token
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@docuflow.com",
    "password": "Admin123!",
    "full_name": "Admin User"
  }'

# Save the returned JWT token
```

### Step 3: Configure n8n Credentials

1. Open n8n: `http://localhost:5678`
2. Go to Credentials → Add Credential
3. Add **PostgreSQL**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `docprocessing`
   - User: `postgres`
   - Password: `password`
4. Add **HTTP Header Auth** (for backend API):
   - Name: `Authorization`
   - Value: `Bearer <YOUR_JWT_TOKEN>`
5. Add **OpenAI** (or your LLM):
   - API Key: `<YOUR_OPENAI_KEY>`

### Step 4: Import Workflow

Create a new workflow with these nodes:

```
1. Schedule Trigger (every 5 min)
2. PostgreSQL: Query pending documents
3. IF node: Check if documents exist
4. HTTP Request: Download file
5. Code: Detect file type
6. IF: Image or PDF?
   - Image → Tesseract OCR
   - PDF → PDF Parse
7. OpenAI: Extract data
8. Code: Validate data
9. HTTP Request: POST to webhook
10. PostgreSQL: Update status
```

### Step 5: Test Workflow

```bash
# Upload a test invoice
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@test-invoice.pdf" \
  -F "document_type=invoice"

# Wait 5 minutes for n8n to poll
# Or manually trigger n8n workflow

# Check processing status
curl -X GET http://localhost:3001/api/documents \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 11. PRODUCTION DEPLOYMENT CHECKLIST

- [ ] Enable webhook signature verification
- [ ] Configure shared Docker volumes
- [ ] Set up proper secrets management
- [ ] Configure production database (not localhost)
- [ ] Set up SSL/TLS for all services
- [ ] Configure production CORS origins
- [ ] Set up monitoring and logging
- [ ] Implement file cleanup jobs
- [ ] Add Redis caching
- [ ] Configure backup strategy
- [ ] Set up error alerting
- [ ] Load test n8n workflows
- [ ] Document API rate limits
- [ ] Set up CI/CD pipeline

---

**End of Analysis**

**Summary:**
- Backend is a **passive receiver** of webhook data from n8n
- n8n must **actively poll** for new documents
- All AI/OCR/email processing happens in **n8n workflows**
- File transfer via **HTTP download** (no shared volumes currently)
- **No automatic triggering** of n8n from backend
