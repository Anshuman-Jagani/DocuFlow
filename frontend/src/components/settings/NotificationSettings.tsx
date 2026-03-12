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

const ToggleSwitch = ({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? 'bg-[#A0A0A0]' : 'bg-[#1A1A1A]'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Notification preferences saved', 'success');
    } catch (error) {
      showToast('Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        <p className="text-sm text-[#444444] mt-1">
          Manage how you receive notifications and alerts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications Master Toggle */}
        <div className="flex items-center justify-between py-4 border-b border-[#111111]">
          <div>
            <h4 className="font-medium text-white">Email Notifications</h4>
            <p className="text-sm text-[#444444]">Receive notifications via email</p>
          </div>
          <ToggleSwitch
            enabled={preferences.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
        </div>

        {/* Individual Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Document Processed</h4>
              <p className="text-sm text-[#444444]">Get notified when a document is processed</p>
            </div>
            <ToggleSwitch
              enabled={preferences.documentProcessed && preferences.emailNotifications}
              onChange={() => handleToggle('documentProcessed')}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Weekly Report</h4>
              <p className="text-sm text-[#444444]">Receive a weekly summary of your documents</p>
            </div>
            <ToggleSwitch
              enabled={preferences.weeklyReport && preferences.emailNotifications}
              onChange={() => handleToggle('weeklyReport')}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Security Alerts</h4>
              <p className="text-sm text-[#444444]">Important security and account updates</p>
            </div>
            <ToggleSwitch
              enabled={preferences.securityAlerts && preferences.emailNotifications}
              onChange={() => handleToggle('securityAlerts')}
              disabled={!preferences.emailNotifications}
            />
          </div>
        </div>

        {/* Processing Threshold */}
        <div className="pt-4 border-t border-[#111111]">
          <label className="block font-medium text-white mb-2">
            Processing Threshold
          </label>
          <p className="text-sm text-[#444444] mb-4">
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
              className="flex-1 h-1.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#A0A0A0]"
            />
            <span className="font-medium text-white min-w-[80px] text-sm">
              {preferences.processingThreshold} docs
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#111111]">
          <Button type="submit" variant="gray" isLoading={loading}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;
