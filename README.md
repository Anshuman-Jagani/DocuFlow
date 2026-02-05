# DocuFlow - AI-Powered Document Processing System

REST API backend for an intelligent document processing system that handles invoices, resumes, contracts, and receipts. Integrates with n8n workflows via webhooks and provides comprehensive analytics.

## 🚀 Features

- **File Upload & Storage**: Accept PDF, DOCX, PNG, JPG files up to 10MB
- **Webhook Integration**: n8n webhook endpoints for AI processing
- **Document Processing**: Handle invoices, resumes, contracts, and receipts
- **JWT Authentication**: Secure API with JWT tokens and refresh tokens
- **Resume Matching**: AI-powered resume-to-job matching with scoring
- **Contract Analysis**: Risk assessment and expiration tracking
- **Expense Tracking**: Receipt categorization and monthly reports
- **Analytics Dashboard**: Comprehensive statistics and reporting
- **Export Capabilities**: PDF and CSV export functionality
- **Rate Limiting**: Protection against abuse
- **Input Sanitization**: XSS prevention and security hardening

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Anshuman-Jagani/DocuFlow.git
cd DocuFlow
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
# Database (Docker PostgreSQL for local development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/docprocessing

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production-min-32-chars

# Server
PORT=3001
NODE_ENV=development

# CORS (add your frontend URL)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. (Optional) Seed demo data

```bash
npm run seed
```

Demo credentials:
- Email: admin@docuflow.com
- Password: Admin123!

### 7. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 🚀 Render.com Deployment (Free Forever)

Deploy to Render for production - **free forever**, perfect for your April demo!

### Quick Deploy with Blueprint:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Select your GitHub repo
   - Click "Apply"
   - Done! 🎉

📖 **Detailed Guide:** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Why Render?**
- ✅ Free forever (not just 30 days)
- ✅ Free PostgreSQL included
- ✅ Auto-deploys from GitHub
- ✅ Perfect for demos and learning

## 📚 API Documentation

### Interactive Documentation (Swagger UI)
Visit `/api-docs` when server is running:
- **Local:** http://localhost:3001/api-docs
- **Production:** https://your-app.onrender.com/api-docs

### Quick Reference
See [API_REFERENCE.md](./API_REFERENCE.md) for complete endpoint documentation.

### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/v1/health` - Health check with database connection

## 🔌 Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/upload` - Upload document
- `GET /api/documents` - List documents (paginated)
- `GET /api/documents/:id/download` - Download file

### Invoices
- `GET /api/invoices` - List invoices
- `GET /api/invoices/stats` - Get statistics
- `GET /api/invoices/export/csv` - Export to CSV
- `GET /api/invoices/:id/export/pdf` - Export to PDF

### Resumes
- `GET /api/resumes` - List resumes
- `POST /api/resumes/:id/match-job` - Match to job posting

### Contracts
- `GET /api/contracts/expiring` - Get expiring contracts
- `GET /api/contracts/high-risk` - Get high-risk contracts

### Receipts
- `GET /api/receipts/by-category` - Group by category
- `GET /api/receipts/monthly-report` - Monthly expense report

### Dashboard
- `GET /api/dashboard/overview` - Overall statistics

**Full API list:** 40+ endpoints - see `/api-docs` or [API_REFERENCE.md](./API_REFERENCE.md)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Use token in requests
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

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

**Test Results:**
- Total Tests: 90
- Pass Rate: 100%
- Code Coverage: ~48%

## 📊 Database Schema

- **Users** - Authentication and authorization
- **Documents** - File metadata and processing status
- **Invoices** - Invoice data with JSONB fields
- **Resumes** - Candidate information and skills
- **Contracts** - Contract analysis and risk assessment
- **Receipts** - Expense tracking and categorization
- **JobPostings** - Job requirements for matching

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost |
| `MAX_FILE_SIZE` | Max upload size in bytes | 10485760 |

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete environment variable reference.

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
npm run migrate      # Run database migrations
npm run migrate:prod # Run migrations on Railway
npm run seed         # Seed demo data
npm run lint         # Lint code
npm run format       # Format code
```

## 📁 Project Structure

```
DocuFlow/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models (Sequelize)
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── tests/               # Test files (Jest + Supertest)
├── docs/                # API documentation (Swagger)
├── uploads/             # File storage
├── railway.json         # Railway deployment config
├── server.js            # Entry point
└── package.json
```

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (auth, upload, API, webhooks)
- Input sanitization (XSS prevention)
- CORS configuration
- Helmet security headers
- User-based data isolation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📖 Documentation

- [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
- [API Reference](./API_REFERENCE.md)
- [Project Report](./PROJECT_REPORT.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

## 👥 Support

- **Repository:** https://github.com/Anshuman-Jagani/DocuFlow
- **Issues:** https://github.com/Anshuman-Jagani/DocuFlow/issues

---

**Status:** Day 10 Complete - Backend Ready for Render Deployment ✅  
**Version:** 1.0.0  
**Deployment:** Render.com (Free Forever)  
**Last Updated:** February 5, 2026
