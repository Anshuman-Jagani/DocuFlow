import { useState } from 'react';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';

interface NotificationPreferences {
  emailNotifications: boolean;
  documentProcessed: boolean;
  weeklyReport: boolean;
  securityAlerts: boolean;
  processingThreshold: number;
}

const NotificationSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    documentProcessed: true,
    weeklyReport: false,
    securityAlerts: true,
    processingThreshold: 100,
  });

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleThresholdChange = (value: number) => {
    setPreferences({
      ...preferences,
      processingThreshold: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      showToast('Notification preferences saved', 'success');
    } catch (error) {
      showToast('Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage how you receive notifications and alerts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications Master Toggle */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive notifications via email</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('emailNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.emailNotifications ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Individual Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Document Processed</h4>
              <p className="text-sm text-gray-600">Get notified when a document is processed</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('documentProcessed')}
              disabled={!preferences.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.documentProcessed && preferences.emailNotifications
                  ? 'bg-primary'
                  : 'bg-gray-200'
              } ${!preferences.emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.documentProcessed && preferences.emailNotifications
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Report</h4>
              <p className="text-sm text-gray-600">Receive a weekly summary of your documents</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('weeklyReport')}
              disabled={!preferences.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.weeklyReport && preferences.emailNotifications
                  ? 'bg-primary'
                  : 'bg-gray-200'
              } ${!preferences.emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.weeklyReport && preferences.emailNotifications
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Security Alerts</h4>
              <p className="text-sm text-gray-600">Important security and account updates</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('securityAlerts')}
              disabled={!preferences.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.securityAlerts && preferences.emailNotifications
                  ? 'bg-primary'
                  : 'bg-gray-200'
              } ${!preferences.emailNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.securityAlerts && preferences.emailNotifications
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Processing Threshold */}
        <div className="pt-4 border-t">
          <label className="block font-medium text-gray-900 mb-2">
            Processing Threshold
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Get notified when monthly processing exceeds this limit
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={preferences.processingThreshold}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="font-medium text-gray-900 min-w-[80px]">
              {preferences.processingThreshold} docs
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button type="submit" isLoading={loading}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;
