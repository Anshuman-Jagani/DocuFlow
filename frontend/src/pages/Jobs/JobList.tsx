import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../../services/documentApi';
import type { Job, JobFilters } from '../../types/job';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Briefcase, Plus, MapPin, Clock, ChevronRight, Users, Search } from 'lucide-react';

const JobList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({ search: '', department: '', status: '' });

  useEffect(() => { fetchJobs(); }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobApi.getJobs(filters);
      setJobs(response.data || []);
    } catch { showToast('Failed to fetch jobs', 'error'); }
    finally { setLoading(false); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open':   return 'bg-success/10 text-success border border-success/20';
      case 'closed': return 'bg-danger/10 text-danger border border-danger/20';
      default:       return 'bg-[#1A1A1A] text-[#444444] border border-[#111111]';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Job Postings</h1>
            <p className="mt-1 text-sm text-[#444444]">Manage vacancies and view matched candidates from your resume pool.</p>
          </div>
          <button onClick={() => navigate('/jobs/new')}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#A0A0A0] text-[#888888] rounded-lg hover:bg-[#111111] hover:shadow-glow-white-sm transition-colors flex items-center gap-2 font-medium text-sm">
            <Plus className="w-5 h-5" /> Create Posting
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#111111] p-4 rounded-xl flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444444] w-4 h-4" />
            <input type="text" placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors text-sm"
              value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          </div>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white focus:outline-none focus:border-[#A0A0A0] transition-colors text-sm">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0A0A0]" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#0A0A0A] border-2 border-dashed border-[#111111] rounded-xl py-20 text-center">
            <Briefcase className="w-12 h-12 text-[#444444] mx-auto mb-4" />
            <p className="text-[#444444]">No job postings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-[#0A0A0A] border border-[#111111] p-6 rounded-xl hover:border-[#A0A0A0] hover:bg-[#1A1A1A] transition-all cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#444444]">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusStyle(job.status)}`}>{job.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[#444444] uppercase font-bold tracking-widest">Matches</p>
                      <p className="text-lg font-bold text-white flex items-center justify-end gap-1">
                        <Users className="w-4 h-4 text-[#888888]" /> {job.matched_resumes?.length || 0}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#282828] group-hover:text-[#888888] transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobList;
