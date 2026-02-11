# DocuFlow Frontend - Intelligent Document Management UI

A modern, responsive React application for AI-powered document management with intelligent OCR processing, document classification, and data extraction.

## ✨ Features

### Core Functionality
- **Intuitive Dashboard**: Real-time statistics with interactive charts and document distribution visualization
- **Smart Upload**: Drag-and-drop file uploader with automatic document type detection
- **User Authentication**: Secure login/register with JWT token management
- **Settings Management**: Comprehensive user settings with profile, security, notifications, and API key management

### Document Modules
- **Invoices**: Advanced table view with filtering, sorting, pagination, and CSV export
- **Receipts**: Gallery view for visual browsing with analytics dashboard
- **Resumes**: AI-powered talent matching with skill visualization and scoring
- **Contracts**: Legal document management with risk indicators and obligation tracking
- **Jobs**: Vacancy management with AI-suggested candidate matching

### UX Features
- **Loading States**: Skeleton loaders for smooth loading experiences
- **Error Handling**: Global error boundary with graceful fallback UI
- **Empty States**: Contextual empty states with actionable CTAs
- **Toast Notifications**: Real-time feedback for user actions
- **Responsive Design**: Mobile-first design that works on all devices
- **Smooth Animations**: Subtle transitions and micro-interactions

## 🛠️ Tech Stack

- **Framework**: React 19 with Vite
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3
- **State Management**: Zustand (Authentication)
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v6

## 📦 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd DocuFlow/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:3001
   ```
   
   > **Note**: Ensure `VITE_API_URL` matches your backend server URL

4. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

5. **Build for production**:
   ```bash
   npm run build
   ```
   
   Production files will be in the `dist/` directory

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, Card, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   │   ├── settings/       # Settings page components
│   │   └── ErrorBoundary.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx
│   │   ├── InvoiceList.tsx
│   │   ├── ResumeList.tsx
│   │   ├── Receipts/
│   │   ├── Contracts/
│   │   ├── Jobs/
│   │   └── SettingsPage.tsx
│   ├── services/           # API service layer
│   │   ├── api.ts
│   │   └── documentApi.ts
│   ├── stores/             # Zustand state stores
│   │   └── authStore.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts
│   │   └── invoice.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useToast.ts
│   ├── utils/              # Utility functions
│   │   └── helpers.ts
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind imports
├── public/                 # Static assets
├── .env.example            # Environment variable template
├── package.json
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── TASK_TRACKER.md         # Development progress tracker
└── README.md
```

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` |

## 🎨 Component Library

### UI Components
- `Button` - Versatile button with variants (primary, secondary, danger, ghost, outline)
- `Input` - Form input with label, error, and helper text support
- `Card` - Container component for content grouping
- `Modal` - Accessible modal dialog
- `Tabs` - Tabbed interface component
- `Badge` - Status and category indicators
- `Skeleton` - Loading placeholder components
- `EmptyState` - Contextual empty state displays
- `Toast` - Notification system with custom provider

### Layout Components
- `DashboardLayout` - Main application layout with sidebar and header
- `Header` - Top navigation bar with user menu
- `Sidebar` - Collapsible navigation sidebar

## 🔐 Authentication

The app uses JWT-based authentication with tokens stored in localStorage via Zustand persist middleware. Protected routes automatically redirect to login if the user is not authenticated.

### Auth Flow
1. User logs in via `/login`
2. Backend returns JWT token and user data
3. Token stored in Zustand auth store (persisted to localStorage)
4. Token included in all API requests via Axios interceptor
5. Automatic redirect to login on 401 responses

## 📊 State Management

- **Global State**: Zustand for authentication state
- **Server State**: TanStack Query for API data fetching, caching, and synchronization
- **Local State**: React useState for component-specific state

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms (Vercel, Netlify, etc.).

## 📝 Development Progress

Track detailed development milestones and completed features in [TASK_TRACKER.md](./TASK_TRACKER.md).

## 🤝 Contributing

1. Follow the existing code style and component patterns
2. Use TypeScript for all new code
3. Ensure responsive design for all new features
4. Add proper error handling and loading states
5. Test on multiple browsers and devices

## 📄 License

This project is part of the DocuFlow document management system.

## 🐛 Known Issues

- Avatar upload functionality not yet implemented in Profile Settings
- Mobile responsiveness needs testing on tablet viewports

## 🔮 Future Enhancements

- Real-time document processing notifications via WebSockets
- Advanced search with filters across all document types
- Batch operations for document management
- Dark mode support
- Accessibility improvements (ARIA labels, keyboard navigation)
- Performance optimization (lazy loading, code splitting)
