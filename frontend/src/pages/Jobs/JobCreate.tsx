import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../../services/documentApi';
import type { Job } from '../../types/job';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, Briefcase, Plus, X, Save, Info } from 'lucide-react';

const inputClass = 'w-full px-4 py-2 bg-[#0A0A0A] border border-[#111111] rounded-xl text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors text-sm';

const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '', department: '', location: '', type: 'full-time', description: '', required_skills: [] as string[], status: 'open',
  });
  const [newRequirement, setNewRequirement] = useState('');

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({ ...formData, required_skills: [...(formData.required_skills || []), newRequirement.trim()] });
      setNewRequirement('');
    }
  };
  const removeRequirement = (index: number) => {
    setFormData({ ...formData, required_skills: formData.required_skills?.filter((_: string, i: number) => i !== index) });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return showToast('Please fill in required fields', 'error');
    try {
      setLoading(true);
      await jobApi.createJob(formData);
      showToast('Job posting created successfully', 'success');
      navigate('/jobs');
    } catch { showToast('Failed to create job posting', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-[#444444] hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="bg-[#0A0A0A] border border-[#111111] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#111111] flex items-center justify-between bg-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#A0A0A0]/10 border border-[#A0A0A0]/20 rounded-lg">
                <Briefcase className="w-5 h-5 text-[#888888]" />
              </div>
              <h1 className="text-xl font-bold text-white">Create New Job Posting</h1>
            </div>
            <p className="text-xs text-[#444444] font-medium italic flex items-center gap-1">
              <Info className="w-3 h-3" /> This will trigger AI matching for existing resumes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  { label: 'Job Title *', placeholder: 'e.g. Senior Backend Engineer', key: 'title', required: true },
                  { label: 'Department', placeholder: 'e.g. Engineering', key: 'department', required: false },
                  { label: 'Location', placeholder: 'e.g. New York or Remote', key: 'location', required: false },
                ] as Array<{ label: string; placeholder: string; key: keyof Job; required: boolean }>
              ).map(({ label, placeholder, key, required }) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">{label}</label>
                  <input type="text" required={required} placeholder={placeholder} className={inputClass}
                    value={formData[key] as string || ''} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">Employment Type</label>
                <select className={inputClass} value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">Detailed Description *</label>
              <textarea required rows={6} placeholder="Describe the role, impact, and daily responsibilities..."
                className={`${inputClass} resize-none`}
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-[#444444] uppercase tracking-widest">Key Requirements (for AI matching)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. 5+ years experience with Node.js" className={inputClass}
                  value={newRequirement} onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())} />
                <button type="button" onClick={handleAddRequirement}
                  className="p-2 bg-[#0A0A0A] border border-[#111111] text-[#444444] rounded-xl hover:border-[#A0A0A0] hover:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.required_skills?.map((req: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-black border border-[#111111] px-3 py-1.5 rounded-full text-sm font-medium text-[#888888]">
                    {req}
                    <button onClick={() => removeRequirement(i)} type="button" className="text-[#444444] hover:text-danger transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#111111] flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/jobs')}
                className="px-6 py-2.5 text-sm font-bold text-[#444444] border border-[#111111] rounded-xl hover:bg-[#111111] hover:text-white transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="px-8 py-2.5 bg-[#0A0A0A] border border-[#A0A0A0] text-[#888888] rounded-xl font-bold flex items-center gap-2 hover:bg-[#111111] hover:shadow-glow-white-sm transition-all disabled:opacity-50 text-sm">
                <Save className="w-5 h-5" />
                {loading ? 'Posting...' : 'Save & Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobCreate;
