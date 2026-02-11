# DocuFlow - AI-Powered Intelligent Document Processing (IDP)

DocuFlow is an intelligent document management and workflow automation system that streamlines document processing, storage, and analysis. It leverages AI to classify documents, extract structured data, and automate workflows through n8n integration.

## 🎯 Project Overview

DocuFlow helps organizations manage their documentation lifecycle with AI-driven insights:
- **Automatic Classification**: Identify if a document is an Invoice, Receipt, Resume, or Contract.
- **Intelligent Extraction**: Extract dates, amounts, skills, and risk factors automatically.
- **AI Matching**: Automatically match candidates (Resumes) to Job Postings with score-based ranking.
- **Expense Analytics**: Visualize spending trends and tax-deductible category breakdowns.
- **Risk Assessment**: Analyze legal contracts for "Red Flags" and key obligations.
- **Workflow Automation**: Deep integration with n8n for custom processing pipelines.

## 🏗️ Architecture

This is a **monorepo** consisting of a modern React frontend and a robust Node.js backend.

```
DocuFlow/
├── frontend/            # React + Vite + TypeScript UI
│   ├── src/            # Components, Pages, Hooks, Services
│   └── TASK_TRACKER.md # Frontend progress
├── backend/             # Node.js + Express + PostgreSQL API
│   ├── src/            # Controllers, Models, Middleware, Routes
│   ├── tests/          # Integration & Unit tests
│   └── README.md       # Backend deep-dive
├── docs/               # Architecture and specification docs
├── PROJECT_REPORT.md   # Cumulative development logs
└── README.md           # Main project entry (This file)
```

## 🚀 Tech Stack

### Frontend
- **React 19** & **TypeScript** - Type-safe UI development
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Premium, responsive styling
- **TanStack Query** - Efficient server state management
- **Lucide React** - Modern iconography
- **Recharts** - Interactive data visualizations
- **Zustand** - Lightweight state management

### Backend
- **Node.js** & **Express.js** - Scalable REST API
- **PostgreSQL** - Relational data storage
- **Sequelize** - Feature-rich ORM
- **JWT** - Secure stateless authentication
- **Multer** - Multipart file handling
- **Winston** - Structured logging

### DevOps & Automation
- **n8n** - Workflow automation platform
- **Docker** - Containerized database environment
- **Jest** - Unit and integration testing suite
- **Render** - Cloud deployment environment

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Docker (for database)
- npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your JWT_SECRET and DATABASE_URL
docker-compose up -d  # Start PostgreSQL
npm run migrate       # Setup schema
npm run seed          # (Optional) Add demo data
npm run dev           # Starts at http://localhost:3001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure VITE_API_URL (defaults to http://localhost:3001)
npm run dev           # Starts at http://localhost:5173
```

## 🔑 Core Modules

| Module | AI Capabilities | Features |
| :--- | :--- | :--- |
| **Dashboard** | Data Aggregation | Processing trends, spending summaries, recent activity. |
| **Invoices** | Data Extraction | Extract vendor, amount, tax, and line items. Export to CSV/PDF. |
| **Receipts** | Categorization | Expense tracking, spending trends, tax-deductibility detection. |
| **Resumes** | Skill Mapping | Extract experience, education, and skills. AI Match scoring. |
| **Contracts** | Risk Analysis | Detect legal red flags, track obligations and expiry dates. |
| **Jobs** | Talent Matching | Manage vacancies and view AI-matched candidates. |

## 🧪 Testing

The system is built with a test-first mindset.
```bash
# Backend tests
cd backend
npm test
```

## 🌐 Deployment

The system is production-ready and currently deployed on **Render**:
- **API**: [https://docuflow.onrender.com](https://docuflow.onrender.com)
- **Database**: PostgreSQL on Render

## � License & Credits

Developed as a Final Year Project (SEM-8).  
**Author**: Anshuman Jagani  
**Version**: 1.1.0 
