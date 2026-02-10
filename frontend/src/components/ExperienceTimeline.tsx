import React from 'react';
import type { Experience } from '../types/resume';

interface ExperienceTimelineProps {
  experiences: Experience[];
}

const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({ experiences }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="relative pl-8 pb-6 last:pb-0">
          {/* Timeline line */}
          {index !== experiences.length - 1 && (
            <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200"></div>
          )}

          {/* Timeline dot */}
          <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${
            exp.is_current ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
          }`}></div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                <p className="text-sm font-medium text-indigo-600">{exp.company}</p>
              </div>
              {exp.is_current && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Current
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{exp.duration || calculateDuration(exp.start_date, exp.end_date)}</span>
              </div>
            </div>

            {exp.description && (
              <p className="text-sm text-gray-700 mb-3">{exp.description}</p>
            )}

            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Key Responsibilities:</p>
                <ul className="space-y-1">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-indigo-600 mt-1.5">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTimeline;
