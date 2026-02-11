import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApi } from '../../services/documentApi';
import type { Job } from '../../types/job';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Briefcase, 
  Trash2, 
  Users, 
  Star,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobApi.getJobById(id!);
      setJob(response.data);
    } catch (error) {
      showToast('Failed to fetch job details', 'error');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center py-20 animate-pulse">
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
    </DashboardLayout>
  );

  if (!job) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <button 
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded">Vacancy</span>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${job.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {job.status}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.department || 'General'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-white transition-all font-bold text-sm">Edit Posting</button>
              <button className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </section>
              <section>
                <h3 className="font-bold text-gray-900 text-lg mb-3">Requirements</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <h3 className="font-bold text-lg">AI Match Talent</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Automatically identifies candidates from your resume pool that match these job requirements.</p>
                <div className="space-y-3">
                  {job.matched_resumes && job.matched_resumes.length > 0 ? (
                    job.matched_resumes.map((resume) => (
                      <div 
                        key={resume.id}
                        onClick={() => navigate(`/resumes/${resume.id}`)}
                        className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-xl flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-100/20 flex items-center justify-center font-bold text-xs">
                            {resume.candidate_name?.[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{resume.candidate_name}</p>
                            <p className="text-[10px] text-indigo-200">{resume.total_experience_years} years exp</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-yellow-400">{resume.match_score}%</span>
                          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-white/20 rounded-xl">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-indigo-200 italic">No matches detected yet</p>
                    </div>
                  )}
                </div>
                {job.matched_resumes && job.matched_resumes.length > 0 && (
                  <button 
                    onClick={() => navigate('/resumes', { state: { jobId: job.id } })}
                    className="w-full mt-4 py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    View All Matches <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
