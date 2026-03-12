import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../ui/Toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../services/api';

const ProfileSettings = () => {
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Sync form data with user store (only when not editing)
  useEffect(() => {
    console.log('[ProfileSettings] User or isEditing changed:', { 
      hasUser: !!user, 
      userName: user?.full_name,
      isEditing 
    });
    if (user && !isEditing) {
      setFormData({
        name: user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ProfileSettings] Submitting form:', formData);
    setLoading(true);
    
    try {
      const response = await api.patch('/api/users/profile', {
        name: formData.name,
        email: formData.email
      });
      
      const updatedUser = response.data.data;
      useAuthStore.getState().setUser(updatedUser);
      
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
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
    <div className="bg-[#0A0A0A] border border-[#111111] rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Profile Information</h3>
        <p className="text-sm text-[#444444] mt-1">
          Update your account's profile information and email address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

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
        <div className="flex gap-3 pt-4 border-t border-[#111111]">
          {!isEditing ? (
            <Button 
              key="edit-btn"
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                console.log('[ProfileSettings] Entering edit mode');
                setIsEditing(true);
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                key="save-btn"
                type="submit" 
                isLoading={loading}
              >
                Save Changes
              </Button>
              <Button 
                key="cancel-btn"
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  handleCancel();
                }}
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
