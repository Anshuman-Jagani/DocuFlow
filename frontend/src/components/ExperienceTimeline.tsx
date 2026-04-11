import React from 'react';
import type { Experience } from '../types/resume';
import { Briefcase, Clock } from 'lucide-react';

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
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${rem}mo`;
    if (rem === 0) return `${years}yr`;
    return `${years}yr ${rem}mo`;
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <div key={index} className="relative pl-8 pb-4 last:pb-0">
          {/* Connector line */}
          {index !== experiences.length - 1 && (
            <div className="absolute left-[11px] top-7 bottom-0 w-px bg-[#1A1A1A]" />
          )}

          {/* Dot */}
          <div
            className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
              exp.is_current
                ? 'bg-white border-white'
                : 'bg-[#111111] border-[#333333]'
            }`}
          >
            <Briefcase className={`w-2.5 h-2.5 ${exp.is_current ? 'text-black' : 'text-[#555555]'}`} />
          </div>

          {/* Card */}
          <div className="bg-black border border-[#0F0F0F] rounded-xl p-5 hover:border-white/10 transition-all duration-200">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white leading-tight">{exp.position}</h3>
                <p className="text-xs text-[#888888] mt-0.5">{exp.company}</p>
              </div>
              <div className="flex-shrink-0 text-right space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-[#555555] justify-end">
                  <Clock className="w-3 h-3" />
                  {exp.duration || calculateDuration(exp.start_date, exp.end_date)}
                </div>
                <p className="text-[10px] text-[#333333]">
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </p>
                {exp.is_current && (
                  <span className="inline-block px-2 py-0.5 bg-green-400/10 text-green-400 text-[9px] font-bold uppercase tracking-widest rounded border border-green-400/20">
                    Current
                  </span>
                )}
              </div>
            </div>

            {exp.description && (
              <p className="text-xs text-[#555555] mb-3 leading-relaxed">{exp.description}</p>
            )}

            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-[#333333] uppercase tracking-widest mb-2">
                  Responsibilities
                </p>
                <ul className="space-y-1.5">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#555555]">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#333333] flex-shrink-0" />
                      {resp}
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
