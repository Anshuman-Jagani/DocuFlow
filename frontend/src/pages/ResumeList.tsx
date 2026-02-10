import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/documentApi';
import type { Resume, ResumeFilters, ResumeSortField, SortOrder, ViewMode } from '../types/resume';
import ResumeCard from '../components/ResumeCard';
import Pagination from '../components/Pagination';
import { useToast } from '../hooks/useToast';
import DashboardLayout from '../components/layout/DashboardLayout';

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
    search: '',
    skills: [],
    minExperience: 0,
    maxExperience: 50,
    minScore: 0,
    maxScore: 100,
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchResumes();
  }, [page, limit, sortField, sortOrder, filters]);

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
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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

  const removeSkillFilter = (skill: string) => {
    handleFilterChange('skills', filters.skills.filter(s => s !== skill));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      skills: [],
      minExperience: 0,
      maxExperience: 50,
      minScore: 0,
      maxScore: 100,
    });
    setPage(1);
  };

  const SortIcon = ({ field }: { field: ResumeSortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and filter candidate resumes
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Candidate name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Experience Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Experience (years)
            </label>
            <input
              type="number"
              value={filters.minExperience}
              onChange={(e) => handleFilterChange('minExperience', Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Experience (years)
            </label>
            <input
              type="number"
              value={filters.maxExperience}
              onChange={(e) => handleFilterChange('maxExperience', Number(e.target.value))}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Match Score Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Match Score
            </label>
            <input
              type="number"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Match Score
            </label>
            <input
              type="number"
              value={filters.maxScore}
              onChange={(e) => handleFilterChange('maxScore', Number(e.target.value))}
              min={0}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Skills Filter */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkillFilter(skillInput);
                  }
                }}
                placeholder="Add skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={() => addSkillFilter(skillInput)}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkillFilter(skill)}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          <div className="flex items-end lg:col-span-4">
            <button
              onClick={clearFilters}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No resumes found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onClick={() => navigate(`/resumes/${resume.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th
                        onClick={() => handleSort('candidate_name')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Candidate
                          <SortIcon field="candidate_name" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th
                        onClick={() => handleSort('total_experience_years')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Experience
                          <SortIcon field="total_experience_years" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Top Skills
                      </th>
                      <th
                        onClick={() => handleSort('match_score')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          Match Score
                          <SortIcon field="match_score" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resumes.map((resume) => (
                      <tr
                        key={resume.id}
                        onClick={() => navigate(`/resumes/${resume.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resume.candidate_name}</div>
                            {resume.location && (
                              <div className="text-sm text-gray-500">{resume.location}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{resume.email || '-'}</div>
                          <div className="text-sm text-gray-500">{resume.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {resume.total_experience_years} years
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(resume.skills) ? resume.skills : []).slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {(Array.isArray(resume.skills) ? resume.skills : []).length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                +{(Array.isArray(resume.skills) ? resume.skills : []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {resume.match_score !== undefined ? (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              resume.match_score >= 80 ? 'bg-green-100 text-green-800' :
                              resume.match_score >= 60 ? 'bg-blue-100 text-blue-800' :
                              resume.match_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {resume.match_score}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/resumes/${resume.id}`);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            onItemsPerPageChange={setLimit}
          />
        </>
      )}
    </div>
  </DashboardLayout>
  );
};

export default ResumeList;
