import React from 'react';
import type { Resume } from '../types/resume';

interface ResumeCardProps {
  resume: Resume;
  onClick: () => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onClick }) => {
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Not Scored';
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {resume.candidate_name}
          </h3>
          {resume.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {resume.location}
            </p>
          )}
        </div>

        {resume.match_score !== undefined && (
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(resume.match_score)}`}>
              {resume.match_score}%
            </div>
            <span className="text-xs text-gray-500">{getScoreLabel(resume.match_score)}</span>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{resume.total_experience_years} years of experience</span>
        </div>
      </div>

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {resume.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md"
              >
                {skill}
              </span>
            ))}
            {resume.skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                +{resume.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div className="mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <div>
              <p className="font-medium">{resume.education[0].degree}</p>
              <p className="text-xs text-gray-500">{resume.education[0].institution}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {resume.email && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate max-w-[150px]">{resume.email}</span>
            </div>
          )}
          {resume.phone && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{resume.phone}</span>
            </div>
          )}
        </div>

        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
