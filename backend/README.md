# DocuFlow Backend

This is the backend API for DocuFlow - an intelligent document management and workflow automation system.

## 🏗️ Architecture

The backend is built with:
- **Node.js** & **Express.js** - REST API framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM for database management
- **JWT** - Authentication & authorization
- **Multer** - File upload handling
- **n8n Integration** - Webhook-based workflow automation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── tests/               # Unit & integration tests
├── uploads/             # File upload directory
├── scripts/             # Utility scripts
├── postman/             # Postman collection
├── server.js            # Application entry point
└── package.json         # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run migrate
```

4. (Optional) Seed the database:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 Documentation

- [API Reference](./API_REFERENCE.md) - Complete API endpoint documentation
- [n8n Integration Spec](./N8N_INTEGRATION_SPEC.md) - Webhook integration details
- [Render Deployment](./RENDER_DEPLOYMENT.md) - Production deployment guide

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🔐 Security Features

- JWT-based authentication
- Rate limiting on all endpoints
- Input sanitization
- HMAC signature verification for webhooks
- Password hashing with bcrypt

## 🐳 Docker Support

Run with Docker Compose:
```bash
docker-compose up
```

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Rollback last migration
- `npm run seed` - Seed database with demo data

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document

### Specialized Documents
- `/api/invoices` - Invoice management
- `/api/receipts` - Receipt management
- `/api/resumes` - Resume management
- `/api/contracts` - Contract management

### Webhooks (n8n Integration)
- `POST /api/webhooks/invoice-processed` - Invoice processing webhook
- `POST /api/webhooks/receipt-processed` - Receipt processing webhook
- `POST /api/webhooks/resume-processed` - Resume processing webhook
- `POST /api/webhooks/contract-processed` - Contract processing webhook
- `POST /api/webhooks/job-match` - Job matching webhook

## 🌐 Deployment

The backend is deployed on Render.com. See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for details.

## 📄 License

This project is part of an academic project for SEM-8.
