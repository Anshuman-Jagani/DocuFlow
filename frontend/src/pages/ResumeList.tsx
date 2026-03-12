import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/documentApi';
import type { Resume, ResumeFilters, ResumeSortField, SortOrder, ViewMode } from '../types/resume';
import ResumeCard from '../components/ResumeCard';
import Pagination from '../components/Pagination';
import { useToast } from '../hooks/useToast';
import DashboardLayout from '../components/layout/DashboardLayout';

const inputClass = 'w-full px-3 py-2 bg-[#0A0A0A] border border-[#111111] rounded-lg text-white placeholder-[#5A5A5A] focus:outline-none focus:border-[#A0A0A0] transition-colors';
const labelClass = 'block text-[10px] font-bold text-[#444444] uppercase tracking-widest mb-1';

const ResumeList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<ResumeSortField>('match_score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [filters, setFilters] = useState<ResumeFilters>({
    search: '', skills: [], minExperience: 0, maxExperience: 50, minScore: 0, maxScore: 100,
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => { fetchResumes(); }, [page, limit, sortField, sortOrder, filters]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeApi.getResumes(filters, page, limit, sortField, sortOrder);
      setResumes(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to fetch resumes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: ResumeSortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const handleFilterChange = (key: keyof ResumeFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const addSkillFilter = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      handleFilterChange('skills', [...filters.skills, skill]);
      setSkillInput('');
    }
  };
  const removeSkillFilter = (skill: string) => handleFilterChange('skills', filters.skills.filter(s => s !== skill));

  const clearFilters = () => {
    setFilters({ search: '', skills: [], minExperience: 0, maxExperience: 50, minScore: 0, maxScore: 100 });
    setPage(1);
  };

  const SortIcon = ({ field }: { field: ResumeSortField }) => {
    const active = sortField === field;
    const color = active ? 'text-[#888888]' : 'text-[#444444]';
    if (!active) return (
      <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return sortOrder === 'asc' ? (
      <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border border-success/20';
    if (score >= 60) return 'bg-white/10 text-white border border-white/20';
    if (score >= 40) return 'bg-warning/10 text-warning border border-warning/20';
    return 'bg-danger/10 text-danger border border-danger/20';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Resumes</h1>
            <p className="mt-1 text-sm text-[#444444]">Browse and filter candidate resumes</p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#0A0A0A] border border-[#111111] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-[#1A1A1A] text-white' : 'text-[#444444] hover:text-[#888888]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-[#1A1A1A] text-white' : 'text-[#444444] hover:text-[#888888]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className={labelClass}>Search</label>
              <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Candidate name..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Min Experience (yrs)</label>
              <input type="number" value={filters.minExperience} onChange={(e) => handleFilterChange('minExperience', Number(e.target.value))} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Experience (yrs)</label>
              <input type="number" value={filters.maxExperience} onChange={(e) => handleFilterChange('maxExperience', Number(e.target.value))} min={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Min Match Score</label>
              <input type="number" value={filters.minScore} onChange={(e) => handleFilterChange('minScore', Number(e.target.value))} min={0} max={100} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Match Score</label>
              <input type="number" value={filters.maxScore} onChange={(e) => handleFilterChange('maxScore', Number(e.target.value))} min={0} max={100} className={inputClass} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Skills</label>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillFilter(skillInput); } }}
                  placeholder="Add skill..." className={`flex-1 ${inputClass}`} />
                <button onClick={() => addSkillFilter(skillInput)}
                  className="px-4 py-2 bg-[#0A0A0A] border border-[#A0A0A0] text-[#888888] rounded-lg hover:bg-[#111111] transition-colors font-medium text-sm">
                  Add
                </button>
              </div>
              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-400/10 text-purple-400 border border-purple-400/20 text-sm font-medium rounded-full">
                      {skill}
                      <button onClick={() => removeSkillFilter(skill)} className="hover:opacity-70">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-end lg:col-span-4">
              <button onClick={clearFilters}
                className="w-full md:w-auto px-4 py-2 text-sm font-medium text-[#444444] bg-black border border-[#111111] rounded-lg hover:text-white hover:border-[#5A5A5A] transition-colors">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0A0A0]" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-12">
            <div className="flex flex-col items-center justify-center text-[#444444]">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-white">No resumes found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} onClick={() => navigate(`/resumes/${resume.id}`)} />
                ))}
              </div>
            ) : (
              <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black border-b border-[#111111]">
                      <tr>
                        {['candidate_name', 'contact', 'total_experience_years', 'skills', 'match_score'].map((f, i) => (
                          <th key={f}
                            onClick={i !== 1 && i !== 3 ? () => handleSort(f as ResumeSortField) : undefined}
                            className={`px-6 py-3 text-left text-[10px] font-bold text-[#444444] uppercase tracking-widest ${i !== 1 && i !== 3 ? 'cursor-pointer hover:text-[#888888]' : ''}`}>
                            <div className="flex items-center gap-2">
                              {['Candidate', 'Contact', 'Experience', 'Top Skills', 'Match Score'][i]}
                              {i !== 1 && i !== 3 && <SortIcon field={f as ResumeSortField} />}
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-3 text-right text-[10px] font-bold text-[#444444] uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0F0F0F]">
                      {resumes.map((resume) => (
                        <tr key={resume.id} onClick={() => navigate(`/resumes/${resume.id}`)}
                          className="hover:bg-[#111111] cursor-pointer transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{resume.candidate_name}</div>
                            {resume.location && <div className="text-sm text-[#444444]">{resume.location}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{resume.email || '-'}</div>
                            <div className="text-sm text-[#444444]">{resume.phone || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#888888]">{resume.total_experience_years} yrs</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(resume.skills) ? resume.skills : []).slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-400/10 text-purple-400 text-xs font-medium rounded border border-purple-400/20">{skill}</span>
                              ))}
                              {(Array.isArray(resume.skills) ? resume.skills : []).length > 3 && (
                                <span className="px-2 py-0.5 bg-[#111111] text-[#444444] text-xs font-medium rounded">
                                  +{(Array.isArray(resume.skills) ? resume.skills : []).length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {resume.match_score !== undefined ? (
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getScoreBadge(resume.match_score)}`}>
                                {resume.match_score}%
                              </span>
                            ) : <span className="text-sm text-[#444444]">-</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/resumes/${resume.id}`); }}
                              className="text-[#888888] hover:text-white transition-colors font-bold uppercase tracking-wider text-xs">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={setLimit} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumeList;
