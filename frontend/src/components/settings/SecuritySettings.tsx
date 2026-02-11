import { useState } from 'react';
import { useToast } from '../ui/Toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SecuritySettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (newPassword: string) => {
    setFormData({ ...formData, newPassword });
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordStrength < 3) {
      showToast('Please choose a stronger password', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      showToast('Password changed successfully', 'success');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength(0);
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <p className="text-sm text-gray-600 mt-1">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        {/* Current Password */}
        <Input
          label="Current Password"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          required
        />

        {/* New Password */}
        <div>
          <Input
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
            required
          />
          
          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">
                Password strength: <span className="font-medium">{getStrengthText()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm New Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={
            formData.confirmPassword && formData.newPassword !== formData.confirmPassword
              ? 'Passwords do not match'
              : undefined
          }
          required
        />

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button type="submit" isLoading={loading}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
