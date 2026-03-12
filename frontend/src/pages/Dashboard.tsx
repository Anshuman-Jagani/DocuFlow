import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/ui/StatCard";
import ActivityFeed from "../components/ui/ActivityFeed";
import Button from "../components/ui/Button";
import TrendChart from "../components/charts/TrendChart";
import CategoryChart from "../components/charts/CategoryChart";
import { useDashboardStore } from "../stores/dashboardStore";
import { FileText, Clock, CheckCircle, TrendingUp, Upload, FolderOpen } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { overview, activities, trends, trendPeriod, isLoading, setTrendPeriod, refreshAll } = useDashboardStore();

  useEffect(() => { refreshAll(); }, []);

  const docTypes = overview ? [
    { label: 'Invoices',  value: overview.summary.documents_by_type.invoice,  color: 'text-white' },
    { label: 'Receipts',  value: overview.summary.documents_by_type.receipt,  color: 'text-white/70' },
    { label: 'Resumes',   value: overview.summary.documents_by_type.resume,   color: 'text-white/50' },
    { label: 'Contracts', value: overview.summary.documents_by_type.contract, color: 'text-white/30' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mt-1">
              System Overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/upload")} variant="gray" size="sm"
              className="text-[10px] font-bold uppercase tracking-widest">
              <Upload className="h-3.5 w-3.5 mr-2" />Upload
            </Button>
            <Button onClick={() => navigate("/documents")} variant="primary" size="sm"
              className="text-[10px] font-bold uppercase tracking-widest">
              <FolderOpen className="h-3.5 w-3.5 mr-2" />View Documents
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Assets" value={overview?.summary.total_documents || 0}
            icon={FileText} color="blue" isLoading={isLoading} />
          <StatCard title="Active Queue" value={overview?.summary.processing_status.pending || 0}
            icon={Clock} color="yellow" isLoading={isLoading} />
          <StatCard title="Processed" value={overview?.summary.processing_status.completed || 0}
            icon={CheckCircle} color="green" isLoading={isLoading} />
          <StatCard title="Efficiency"
            value={overview?.summary.total_documents && overview.summary.total_documents > 0
              ? `${Math.round(((overview.summary.processing_status?.completed || 0) / overview.summary.total_documents) * 100)}%`
              : "0%"}
            icon={TrendingUp} color="purple" isLoading={isLoading} />
        </div>

        {/* Doc type breakdown */}
        {overview && !isLoading && (
          <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 hover:border-white/10 transition-all duration-300">
            <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-5">Categorical Distribution</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {docTypes.map(({ label, value, color }) => (
                <div key={label}
                  className="text-center p-5 bg-black border border-[#0F0F0F] rounded-lg hover:border-white/10 transition-all duration-300 group cursor-default">
                  <p className={`text-2xl font-bold ${color} transition-all duration-300 group-hover:text-white`}>{value}</p>
                  <p className="text-[9px] text-[#2A2A2A] uppercase font-bold mt-2 tracking-[0.2em]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart data={trends} period={trendPeriod} onPeriodChange={setTrendPeriod} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <CategoryChart
              data={overview ? [
                { name: "Invoices",  value: overview.summary.documents_by_type.invoice },
                { name: "Receipts",  value: overview.summary.documents_by_type.receipt },
                { name: "Resumes",   value: overview.summary.documents_by_type.resume },
                { name: "Contracts", value: overview.summary.documents_by_type.contract },
              ] : []}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-2">
            <ActivityFeed activities={activities} isLoading={isLoading} />
          </div>

          {/* Financial snapshot */}
          {overview && overview.summary.documents_by_type.invoice > 0 && (
            <div className="lg:col-span-1 bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 hover:border-white/10 transition-all duration-300">
              <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.18em] mb-5">Financial Snapshot</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black p-4 border border-[#0F0F0F] rounded-lg hover:border-white/5 transition-all">
                  <span className="text-[9px] font-bold text-[#333333] uppercase tracking-widest">Total Invoiced</span>
                  <span className="font-bold text-white text-lg tracking-tight">
                    ${overview.financial.invoices.total_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-black p-4 border border-[#0F0F0F] rounded-lg hover:border-white/5 transition-all">
                  <span className="text-[9px] font-bold text-[#333333] uppercase tracking-widest">Active Contracts</span>
                  <span className="font-bold text-white/60 text-lg tracking-tight">
                    {overview.summary.documents_by_type.contract}
                  </span>
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
