import { formatDistanceToNow } from 'date-fns';
import { FileText, Upload, Trash2, Download, FileCheck } from 'lucide-react';
import type { Activity } from '../../services/dashboardService';
import clsx from 'clsx';

interface ActivityFeedProps { activities: Activity[]; isLoading?: boolean; }

const activityIcons = { upload: Upload, process: FileCheck, delete: Trash2, export: Download };
const activityColors = {
  upload:  'text-white/60 bg-white/5',
  process: 'text-[#4ADE80] bg-[#4ADE80]/10',
  delete:  'text-[#F87171] bg-[#F87171]/10',
  export:  'text-white/40 bg-white/5',
};
const docTypeColors = {
  invoice:  'bg-white/5 text-white/50',
  receipt:  'bg-[#4ADE80]/10 text-[#4ADE80]',
  resume:   'bg-white/5 text-white/40',
  contract: 'bg-[#FBBF24]/10 text-[#FBBF24]',
};

export default function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  if (isLoading) return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 animate-pulse">
      <div className="h-2.5 bg-[#111111] rounded w-28 mb-5" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-9 w-9 bg-[#111111] rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#111111] rounded w-3/4" />
              <div className="h-2.5 bg-[#111111] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (activities.length === 0) return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6">
      <p className="text-[10px] font-bold text-[#222222] uppercase tracking-[0.2em] mb-4">Recent Activity</p>
      <div className="text-center py-8">
        <FileText className="h-10 w-10 text-[#1A1A1A] mx-auto mb-3" />
        <p className="text-[#333333] text-sm font-medium">No recent activity</p>
        <p className="text-xs text-[#222222] mt-1">Upload a document to get started</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6 hover:border-white/10 transition-all duration-300">
      <p className="text-[10px] font-bold text-[#222222] uppercase tracking-[0.2em] mb-5">Recent Activity</p>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || FileText;
          const iconColor = activityColors[activity.type] || 'text-white/30 bg-white/5';
          return (
            <div key={activity.id} className="flex items-start gap-3 group">
              <div className={clsx('p-2 rounded-full flex-shrink-0 transition-all duration-200', iconColor)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80">
                  <span className="font-semibold capitalize">{activity.type}</span>{' '}
                  <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', docTypeColors[activity.documentType])}>
                    {activity.documentType}
                  </span>
                </p>
                <p className="text-xs text-[#333333] truncate mt-0.5">{activity.documentName}</p>
                <p className="text-[10px] text-[#222222] mt-1 font-medium">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
