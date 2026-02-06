# DocuFlow - Intelligent Document Management System

DocuFlow is an intelligent document management and workflow automation system that streamlines document processing, storage, and analysis using AI-powered features and n8n workflow automation.

## 🎯 Project Overview

DocuFlow helps organizations and individuals manage their documents efficiently by:
- Automatically classifying and extracting data from uploaded documents
- Providing intelligent search and filtering capabilities
- Automating workflows through n8n integration
- Offering secure document storage and retrieval
- Matching resumes with job postings using AI

## 🏗️ Architecture

This is a **monorepo** containing both backend and frontend:

```
DocuFlow/
├── backend/             # Node.js/Express API
│   ├── src/            # Source code
│   ├── tests/          # Backend tests
│   ├── uploads/        # File storage
│   └── README.md       # Backend documentation
├── frontend/            # React/Next.js UI (coming soon)
├── docs/               # Project documentation
├── README.md           # This file
├── PROJECT_REPORT.md   # Development progress
├── TASK_TRACKER.md     # Task management
└── IMPLEMENTATION_PLAN.md
```

## 🚀 Tech Stack

### Backend
- **Node.js** & **Express.js** - REST API framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM for database management
- **JWT** - Authentication & authorization
- **Multer** - File upload handling
- **n8n Integration** - Webhook-based workflow automation

### Frontend (Coming Soon)
- **React** - UI framework
- **Next.js** - React framework with SSR
- **TailwindCSS** - Styling

### Testing & Quality
- **Jest** - Testing framework
- **Supertest** - API testing
- **ESLint** - Code quality

## � Getting Started

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL with Docker:**
```bash
docker-compose up -d
```

5. **Run database migrations:**
```bash
npm run migrate
```

6. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

� **For detailed backend setup and API documentation, see [backend/README.md](./backend/README.md)**

### Frontend Setup (Coming Soon)

Frontend development will begin after backend completion.

## � Documentation

- [Backend README](./backend/README.md) - Backend setup and development
- [API Reference](./backend/API_REFERENCE.md) - Complete API endpoint documentation
- [n8n Integration Spec](./backend/N8N_INTEGRATION_SPEC.md) - Webhook integration details
- [Render Deployment](./backend/RENDER_DEPLOYMENT.md) - Production deployment guide
- [Project Report](./PROJECT_REPORT.md) - Development progress and achievements
- [Task Tracker](./TASK_TRACKER.md) - Current task status
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Technical implementation details

## 🔑 Key Features

### Document Management
- Upload and store documents (PDF, DOCX, PNG, JPG)
- Automatic document classification
- Secure file storage with user isolation
- Document search and filtering

### Specialized Document Processing
- **Invoices**: Automatic data extraction, statistics, CSV/PDF export
- **Receipts**: Expense tracking, categorization, monthly reports
- **Resumes**: Skills extraction, job matching with AI scoring
- **Contracts**: Risk assessment, expiration tracking, analysis

### Workflow Automation
- n8n webhook integration for AI processing
- Real-time document processing pipelines
- HMAC signature verification for security
- Automated job matching and notifications

### Security & Performance
- JWT-based authentication with refresh tokens
- Rate limiting on all endpoints
- Input sanitization and XSS prevention
- User-based data isolation
- Comprehensive error handling

## 🧪 Testing

The backend has comprehensive test coverage:

```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

**Test Results:**
- Total Tests: 90+
- Pass Rate: 100%
- Code Coverage: ~48%

## 🌐 Deployment

The backend is deployed on **Render.com** (free forever tier):
- Production URL: https://docuflow.onrender.com
- Free PostgreSQL database included
- Auto-deploys from GitHub
- Perfect for demos and learning

See [backend/RENDER_DEPLOYMENT.md](./backend/RENDER_DEPLOYMENT.md) for deployment instructions.

## � Project Status

**Current Phase:** Backend Complete, Frontend Development Starting

### Completed (Backend)
✅ User authentication & authorization  
✅ Document upload & storage  
✅ Specialized document processing (Invoice, Receipt, Resume, Contract)  
✅ n8n webhook integration  
✅ Dashboard & analytics  
✅ Export functionality (PDF, CSV)  
✅ Security features (rate limiting, sanitization)  
✅ Comprehensive testing  
✅ Production deployment on Render  

### In Progress
🔄 Frontend development setup

### Upcoming
⏳ React/Next.js UI implementation  
⏳ User dashboard interface  
⏳ Document management UI  
⏳ Analytics visualizations  

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of an academic project for SEM-8.

## 👥 Support

- **Repository:** https://github.com/Anshuman-Jagani/DocuFlow
- **Issues:** https://github.com/Anshuman-Jagani/DocuFlow/issues

---

**Version:** 1.0.0  
**Last Updated:** February 6, 2026  
**Status:** Backend Complete ✅ | Frontend Starting 🚀
