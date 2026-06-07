import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, login } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm();

  const onProfileSave = async (data) => {
    setProfileSuccess('');
    setProfileError('');
    try {
      await api.patch('/auth/me', data);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const onPasswordChange = async (data) => {
    setPasswordSuccess('');
    setPasswordError('');
    try {
      await api.patch('/auth/me/password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setPasswordSuccess('Password changed successfully.');
      resetPassword();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">{user?.email}</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-semibold text-white">Personal Information</h2>

        <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-400">First Name</label>
              <input
                {...registerProfile('first_name', { required: 'First name is required.' })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.first_name && (
                <p className="text-red-400 text-xs">{profileErrors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-400">Last Name</label>
              <input
                {...registerProfile('last_name', { required: 'Last name is required.' })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {profileErrors.last_name && (
                <p className="text-red-400 text-xs">{profileErrors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm text-slate-400">Phone (optional)</label>
            <input
              {...registerProfile('phone')}
              type="tel"
              placeholder="+40 700 000 000"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>


          <div className="space-y-1">
            <label className="text-sm text-slate-400">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full bg-slate-700/50 text-slate-400 rounded-lg px-4 py-2.5 cursor-not-allowed"
            />
            <p className="text-slate-500 text-xs">Email cannot be changed.</p>
          </div>

          {profileSuccess && (
            <p className="text-green-400 text-sm">{profileSuccess}</p>
          )}
          {profileError && (
            <p className="text-red-400 text-sm">{profileError}</p>
          )}

          <button
            type="submit"
            disabled={profileSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {profileSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {user?.password_hash !== undefined && (
        <div className="bg-slate-800 rounded-2xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-white">Change Password</h2>

          <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Current Password</label>
              <input
                {...registerPassword('current_password', { required: 'Current password is required.' })}
                type="password"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {passwordErrors.current_password && (
                <p className="text-red-400 text-xs">{passwordErrors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-400">New Password</label>
              <input
                {...registerPassword('new_password', {
                  required: 'New password is required.',
                  minLength: { value: 8, message: 'At least 8 characters.' },
                })}
                type="password"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {passwordErrors.new_password && (
                <p className="text-red-400 text-xs">{passwordErrors.new_password.message}</p>
              )}
            </div>

            {passwordSuccess && (
              <p className="text-green-400 text-sm">{passwordSuccess}</p>
            )}
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {passwordSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}