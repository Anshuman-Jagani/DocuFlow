import { useState } from 'react';
import { useToast } from '../ui/Toast';
import api from '../../services/api';
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
      await api.patch('/api/users/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      showToast('Password changed successfully', 'success');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength(0);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to change password';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-danger';
    if (passwordStrength <= 3) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Change Password</h3>
        <p className="text-sm text-[#444444] mt-1">
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
                    className={`h-1 flex-1 rounded transition-colors ${
                      level <= passwordStrength ? getStrengthColor() : 'bg-[#1A1A1A]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#444444]">
                Password strength:{' '}
                <span className={`font-medium ${
                  passwordStrength <= 2 ? 'text-danger' : passwordStrength <= 3 ? 'text-warning' : 'text-success'
                }`}>
                  {getStrengthText()}
                </span>
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
        <div className="pt-4 border-t border-[#111111]">
          <Button type="submit" variant="gray" isLoading={loading}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
