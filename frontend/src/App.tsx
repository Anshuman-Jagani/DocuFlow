import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Documents from './pages/Documents';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import ResumeList from './pages/ResumeList';
import ResumeDetail from './pages/ResumeDetail';
import ContractList from './pages/Contracts/ContractList';
import ContractDetail from './pages/Contracts/ContractDetail';
import ReceiptList from './pages/Receipts/ReceiptList';
import ReceiptDetail from './pages/Receipts/ReceiptDetail';
import ReceiptAnalytics from './pages/Receipts/ReceiptAnalytics';
import JobList from './pages/Jobs/JobList';
import JobDetail from './pages/Jobs/JobDetail';
import JobCreate from './pages/Jobs/JobCreate';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />

          {/* Invoice routes */}
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            }
          />

          {/* Resume routes */}
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <ResumeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes/:id"
            element={
              <ProtectedRoute>
                <ResumeDetail />
              </ProtectedRoute>
            }
          />

          {/* Contract routes */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute>
                <ContractList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contracts/:id"
            element={
              <ProtectedRoute>
                <ContractDetail />
              </ProtectedRoute>
            }
          />

          {/* Receipt routes */}
          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <ReceiptList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts/:id"
            element={
              <ProtectedRoute>
                <ReceiptDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts/analytics"
            element={
              <ProtectedRoute>
                <ReceiptAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Job routes */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute>
                <JobCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for other pages */}
          <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
