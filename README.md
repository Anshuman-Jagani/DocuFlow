# Document Processing API

REST API backend for an AI-powered document processing system that handles invoices, resumes, contracts, and receipts. Integrates with n8n workflows via webhooks and provides data to a React dashboard.

## 🚀 Features

- **File Upload & Storage**: Accept PDF, DOCX, PNG, JPG files up to 10MB
- **Webhook Integration**: Secure n8n webhook endpoints with HMAC verification
- **Document Processing**: Handle invoices, resumes, contracts, and receipts
- **JWT Authentication**: Secure API with JWT tokens and refresh tokens
- **Resume Matching**: AI-powered resume-to-job matching with scoring
- **Contract Analysis**: Risk assessment and legal review flagging
- **Expense Tracking**: Receipt categorization and tax deduction tracking
- **Analytics Dashboard**: Comprehensive statistics and reporting
- **Export Capabilities**: PDF and CSV/Excel export functionality

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd document-processing-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/docprocessing

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production-min-32-chars

# n8n Webhook
N8N_WEBHOOK_SECRET=your-webhook-secret-shared-with-n8n-instance

# Server
PORT=3000
NODE_ENV=development
```

### 4. Create PostgreSQL database

```bash
createdb docprocessing
```

Or using psql:

```sql
CREATE DATABASE docprocessing;
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
document-processing-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── uploads/             # File storage
├── tests/               # Test files
├── docs/                # Documentation
├── server.js            # Entry point
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/upload` - Upload document
- `GET /api/documents` - List documents (paginated)
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download file
- `POST /api/documents/:id/reprocess` - Trigger reprocessing

### Invoices
- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `GET /api/invoices/stats` - Get statistics
- `GET /api/invoices/:id/export` - Export as PDF/CSV

### Resumes
- `GET /api/resumes` - List resumes
- `GET /api/resumes/:id` - Get resume details
- `POST /api/resumes/:id/match-job` - Match to job
- `GET /api/resumes/top-candidates` - Get top candidates

### Contracts
- `GET /api/contracts` - List contracts
- `GET /api/contracts/:id` - Get contract details
- `GET /api/contracts/expiring` - Get expiring contracts
- `GET /api/contracts/high-risk` - Get high-risk contracts

### Receipts
- `GET /api/receipts` - List receipts
- `GET /api/receipts/:id` - Get receipt details
- `GET /api/receipts/by-category` - Group by category
- `GET /api/receipts/monthly-report` - Monthly report
- `GET /api/receipts/export` - Export as CSV/Excel

### Job Postings
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Webhooks (n8n Integration)
- `POST /api/webhooks/document-uploaded`
- `POST /api/webhooks/invoice-processed`
- `POST /api/webhooks/resume-processed`
- `POST /api/webhooks/contract-analyzed`
- `POST /api/webhooks/receipt-processed`

### Dashboard
- `GET /api/dashboard/overview` - Overall statistics
- `GET /api/dashboard/invoices-summary` - Invoice analytics
- `GET /api/dashboard/resume-pipeline` - Candidate funnel
- `GET /api/dashboard/expense-trends` - Expense trends

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

### Health Check
- `GET /health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. Register or login to get access token:
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

2. Include token in subsequent requests:
```bash
Authorization: Bearer <your-jwt-token>
```

## 📤 File Upload

Upload documents using multipart/form-data:

```bash
POST /api/upload
Content-Type: multipart/form-data

file: <file>
document_type: invoice|resume|contract|receipt
```

**Supported formats**: PDF, DOCX, PNG, JPG  
**Max file size**: 10MB

## 🔗 n8n Webhook Integration

### Webhook Security

All webhooks require HMAC signature verification:

```javascript
Headers:
  X-Webhook-Signature: sha256=<signature>
  X-Webhook-Timestamp: <unix_timestamp>
```

### Webhook Payload Example

```json
{
  "document_id": "uuid",
  "document_type": "invoice",
  "processed_data": {
    "invoice_number": "INV-001",
    "total_amount": 1500.00,
    ...
  },
  "validation": {
    "status": "valid",
    "confidence_score": 95,
    "errors": []
  },
  "timestamp": "2026-01-27T12:48:25Z"
}
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode:
```bash
npm run test:watch
```

## 📊 Database Schema

### Users
- User authentication and authorization
- Role-based access control (admin, user)

### Documents
- File metadata and storage
- Processing status tracking

### Invoices
- Invoice data extraction
- Validation and confidence scoring

### Resumes
- Candidate information
- Skills and experience tracking
- Job matching scores

### Contracts
- Contract analysis
- Risk assessment
- Legal review flags

### Receipts
- Expense tracking
- Tax deduction categorization

### Job Postings
- Job requirements
- Skills matching

## 🐳 Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- API server on port 3000
- PostgreSQL database on port 5432

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | - |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration | 30d |
| `N8N_WEBHOOK_SECRET` | n8n webhook secret | - |
| `N8N_BASE_URL` | n8n instance URL | - |
| `MAX_FILE_SIZE` | Max upload size in bytes | 10485760 |
| `UPLOAD_DIR` | File upload directory | ./uploads |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |
| `LOG_LEVEL` | Logging level | info |

## 🔧 Development

### Database Migrations

Create a new migration:
```bash
npx sequelize-cli migration:generate --name migration-name
```

Run migrations:
```bash
npm run migrate
```

Undo last migration:
```bash
npm run migrate:undo
```

### Code Formatting

Format code:
```bash
npm run format
```

Lint code:
```bash
npm run lint
```

## 📖 API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

(Swagger UI - to be implemented in Day 14)

## 🚧 Development Timeline

- **Week 1 (Days 1-5)**: Foundation & Core Setup
- **Week 2 (Days 6-10)**: Webhook Integration & API Development
- **Week 3 (Days 11-15)**: Analytics, Security & Deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@example.com or open an issue in the repository.

---

**Status**: Day 1 - Project Initialization Complete ✅
