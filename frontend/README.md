# DocuFlow Frontend - Intelligent UI

This is the frontend application for DocuFlow, a modern, responsive React interface for AI-powered document management.

## ✨ Features

- **Intuitive Dashboard**: Real-time stats and data visualization.
- **Smart Upload**: Drag-and-drop file uploader with type-specific routing.
- **Document Modules**:
    - **Invoices**: Table-based list with advanced search and PDF extraction.
    - **Receipts**: Gallery view for visual scan browsing and analytics.
    - **Resumes**: Score-based talent matching and skill visualization.
    - **Contracts**: Legal risk indicators and obligation tracking.
    - **Jobs**: Vacancy management with AI-surfaced candidates.
- **Premium Design**: Dark-mode support, smooth animations, and responsive layouts.

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand (Auth)
- **Networking**: Axios + TanStack Query
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   # Ensure VITE_API_URL matches your backend (default is http://localhost:3001)
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

- `src/components`: Reusable UI elements (Button, Card, Layout, etc.)
- `src/pages`: Main view components (Dashboard, List views, Details)
- `src/services`: API interaction layer
- `src/store`: Global state (Authentication)
- `src/types`: TypeScript interfaces for data models
- `src/hooks`: Custom React hooks (Toast, etc.)

## 📝 Development Progress

Track detailed development milestones in [TASK_TRACKER.md](./TASK_TRACKER.md).
