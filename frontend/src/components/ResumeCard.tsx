import React from 'react';
import type { Resume } from '../types/resume';

interface ResumeCardProps { resume: Resume; onClick: () => void; }

const getScoreStyle = (score?: number) => {
  if (!score) return 'text-[#333333]';
  if (score >= 80) return 'text-[#4ADE80]';
  if (score >= 60) return 'text-white/70';
  if (score >= 40) return 'text-[#FBBF24]';
  return 'text-[#F87171]';
};
const getScoreLabel = (score?: number) => {
  if (!score) return 'Unscored';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onClick }) => (
  <div onClick={onClick}
    className="bg-[#0A0A0A] rounded-lg border border-[#111111] p-5 hover:border-white/15 hover:shadow-card-hover transition-all duration-300 cursor-pointer group">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors tracking-tight">
          {resume.candidate_name}
        </h3>
        {resume.location && (
          <p className="text-xs text-[#333333] mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {resume.location}
          </p>
        )}
      </div>
      {resume.match_score !== undefined && (
        <div className="flex flex-col items-end gap-0.5">
          <p className={`text-lg font-bold ${getScoreStyle(resume.match_score)}`}>{resume.match_score}%</p>
          <p className="text-[9px] text-[#333333] uppercase tracking-widest font-bold">{getScoreLabel(resume.match_score)}</p>
        </div>
      )}
    </div>

    {/* Experience */}
    <div className="flex items-center gap-2 text-xs text-[#444444] mb-3">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span className="font-medium">{resume.total_experience_years}y experience</span>
    </div>

    {/* Skills */}
    {resume.skills && resume.skills.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-4">
        {resume.skills.slice(0, 4).map((skill, i) => (
          <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold rounded uppercase tracking-wide">
            {skill}
          </span>
        ))}
        {resume.skills.length > 4 && (
          <span className="px-2 py-0.5 bg-black border border-[#111111] text-[#333333] text-[10px] font-bold rounded">
            +{resume.skills.length - 4}
          </span>
        )}
      </div>
    )}

    {/* Education */}
    {resume.education && resume.education.length > 0 && (
      <p className="text-[10px] text-[#333333] mb-3 flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
        {resume.education[0].degree} · {resume.education[0].institution}
      </p>
    )}

    {/* Footer */}
    <div className="pt-3 border-t border-[#0F0F0F] flex items-center justify-between">
      <div className="flex items-center gap-3 text-[10px] text-[#222222]">
        {resume.email && <span className="truncate max-w-[130px]">{resume.email}</span>}
        {resume.phone && <span>{resume.phone}</span>}
      </div>
      <span className="text-[10px] font-bold text-[#333333] group-hover:text-white transition-colors uppercase tracking-widest">
        View →
      </span>
    </div>
  </div>
);

export default ResumeCard;
