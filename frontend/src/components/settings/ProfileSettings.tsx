import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../ui/Toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ProfileSettings = () => {
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.full_name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        <p className="text-sm text-gray-600 mt-1">
          Update your account's profile information and email address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" disabled>
              Change Avatar
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              JPG, GIF or PNG. Max size of 2MB
            </p>
          </div>
        </div>

        {/* Name Field */}
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={!isEditing}
          required
        />

        {/* Email Field */}
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={!isEditing}
          required
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button type="submit" isLoading={loading}>
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
