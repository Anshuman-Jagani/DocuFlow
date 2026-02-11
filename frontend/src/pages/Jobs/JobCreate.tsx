import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobApi } from '../../services/documentApi';
import type { Job } from '../../types/job';
import { useToast } from '../../hooks/useToast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Briefcase, 
  Plus, 
  X,
  Save,
  Info
} from 'lucide-react';

const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: [] as string[],
    status: 'open'
  });
  const [newRequirement, setNewRequirement] = useState('');

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...(formData.requirements || []), newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements?.filter((_: string, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return showToast('Please fill in required fields', 'error');
    }

    try {
      setLoading(true);
      await jobApi.createJob(formData);
      showToast('Job posting created successfully', 'success');
      navigate('/jobs');
    } catch (error) {
      showToast('Failed to create job posting', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Create New Job Posting</h1>
            </div>
            <p className="text-xs text-gray-400 font-medium italic flex items-center gap-1">
              <Info className="w-3 h-3" />
              This will trigger AI matching for existing resumes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Job Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Department</label>
                <input 
                  type="text"
                  placeholder="e.g. Engineering"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Location</label>
                <input 
                  type="text"
                  placeholder="e.g. New York or Remote"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Employment Type</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Detailed Description *</label>
              <textarea 
                required
                rows={6}
                placeholder="Describe the role, impact, and daily responsibilities..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700">Key Requirements (for AI matching)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. 5+ years experience with Node.js"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                />
                <button 
                  type="button"
                  onClick={handleAddRequirement}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((req: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
                    {req}
                    <button onClick={() => removeRequirement(i)} type="button" className="text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
              >
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
