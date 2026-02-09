import { formatDistanceToNow } from 'date-fns';
import { FileText, Upload, Trash2, Download, FileCheck } from 'lucide-react';
import type { Activity } from '../../services/dashboardService';
import clsx from 'clsx';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

const activityIcons = {
  upload: Upload,
  process: FileCheck,
  delete: Trash2,
  export: Download,
};

const activityColors = {
  upload: 'text-blue-600 bg-blue-100',
  process: 'text-green-600 bg-green-100',
  delete: 'text-red-600 bg-red-100',
  export: 'text-purple-600 bg-purple-100',
};

const documentTypeColors = {
  invoice: 'bg-blue-50 text-blue-700',
  receipt: 'bg-green-50 text-green-700',
  resume: 'bg-purple-50 text-purple-700',
  contract: 'bg-yellow-50 text-yellow-700',
};

export default function ActivityFeed({ activities, isLoading = false }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Upload a document to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || FileText;
          const iconColor = activityColors[activity.type] || 'text-gray-600 bg-gray-100';
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={clsx('p-2 rounded-full', iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium capitalize">{activity.type}</span>
                  {' '}
                  <span className={clsx(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    documentTypeColors[activity.documentType]
                  )}>
                    {activity.documentType}
                  </span>
                </p>
                <p className="text-sm text-gray-600 truncate">{activity.documentName}</p>
                <p className="text-xs text-gray-400 mt-1">
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
