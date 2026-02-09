import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import ActivityFeed from '../components/ui/ActivityFeed';
import TrendChart from '../components/charts/TrendChart';
import CategoryChart from '../components/charts/CategoryChart';
import { useDashboardStore } from '../stores/dashboardStore';
import { FileText, Clock, CheckCircle, TrendingUp, Upload, FolderOpen } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    overview,
    activities,
    trends,
    trendPeriod,
    isLoading,
    setTrendPeriod,
    refreshAll,
  } = useDashboardStore();

  useEffect(() => {
    refreshAll();
  }, []);

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleViewDocuments = () => {
    navigate('/documents');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleUploadClick}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
            <button
              onClick={handleViewDocuments}
              className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              View All Documents
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Documents"
            value={overview?.totalDocuments || 0}
            icon={FileText}
            color="blue"
            isLoading={isLoading}
            trend={
              overview?.totalDocuments && overview.totalDocuments > 0 && overview.thisMonth?.uploaded !== undefined
                ? {
                    value: Math.round((overview.thisMonth.uploaded / overview.totalDocuments) * 100),
                    isPositive: true,
                  }
                : undefined
            }
          />
          <StatCard
            title="Pending Processing"
            value={overview?.processingStatus.pending || 0}
            icon={Clock}
            color="yellow"
            isLoading={isLoading}
          />
          <StatCard
            title="Completed This Month"
            value={overview?.thisMonth.processed || 0}
            icon={CheckCircle}
            color="green"
            isLoading={isLoading}
          />
          <StatCard
            title="Processing Rate"
            value={
              overview?.totalDocuments && overview.totalDocuments > 0
                ? `${Math.round(((overview.processingStatus?.completed || 0) / overview.totalDocuments) * 100)}%`
                : '0%'
            }
            icon={TrendingUp}
            color="purple"
            isLoading={isLoading}
          />
        </div>

        {/* Document Type Breakdown */}
        {overview && !isLoading && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{overview.documentsByType.invoice}</p>
                <p className="text-sm text-gray-600 mt-1">Invoices</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{overview.documentsByType.receipt}</p>
                <p className="text-sm text-gray-600 mt-1">Receipts</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{overview.documentsByType.resume}</p>
                <p className="text-sm text-gray-600 mt-1">Resumes</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{overview.documentsByType.contract}</p>
                <p className="text-sm text-gray-600 mt-1">Contracts</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TrendChart
              data={trends}
              period={trendPeriod}
              onPeriodChange={setTrendPeriod}
              isLoading={isLoading}
            />
          </div>

          {/* Category Distribution - Takes 1 column */}
          <div className="lg:col-span-1">
            <CategoryChart
              data={
                overview
                  ? [
                      { name: 'Invoices', value: overview.documentsByType.invoice },
                      { name: 'Receipts', value: overview.documentsByType.receipt },
                      { name: 'Resumes', value: overview.documentsByType.resume },
                      { name: 'Contracts', value: overview.documentsByType.contract },
                    ]
                  : []
              }
              isLoading={isLoading}
            />
          </div>

          {/* Activity Feed - Takes 2 columns (or full width on mobile) */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={activities} isLoading={isLoading} />
          </div>

          {/* Financial Summary if available - Placeholder for future expansion */}
          {overview && overview.documentsByType.invoice > 0 && (
             <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Snaphot</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">Total Invoiced</span>
                   <span className="font-bold text-blue-600">Pending Sync</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-600">Active Contracts</span>
                   <span className="font-bold text-purple-600">{overview.documentsByType.contract}</span>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
