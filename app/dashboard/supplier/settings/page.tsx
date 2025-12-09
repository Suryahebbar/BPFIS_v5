"use client";

import { useState, useEffect } from 'react';
import { withSupplierAuth } from '@/lib/supplier-auth';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Change password modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    reviewNotifications: true,
    marketingEmails: false,
    
    // Business Settings
    autoConfirmOrders: false,
    defaultShippingMethod: 'standard',
    returnPolicy: '30-days',
    taxInclusive: true,
    taxRate: 0.18,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '24h',
    
    // Display Settings
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/supplier/settings', withSupplierAuth());

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelect = (setting: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/supplier/settings', withSupplierAuth({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      }));

      const data = await response.json();

      if (response.ok) {
        setSuccess('Settings saved successfully!');
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitChangePassword = async () => {
    setChangePasswordError('');
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword) {
      setChangePasswordError('Please enter both current and new password');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await fetch('/api/supplier/settings/change-password', withSupplierAuth({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      }));

      const data = await response.json();
      if (response.ok) {
        setSuccess('Password changed successfully');
        setIsChangePasswordOpen(false);
      } else {
        setChangePasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setChangePasswordError('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/supplier/settings/export', withSupplierAuth());
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Failed to download data');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supplier-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      setError('Failed to download data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = confirm('Are you sure you want to deactivate your account? This will also deactivate your products.');
    if (!confirm1) return;

    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/supplier/settings/account', withSupplierAuth({
        method: 'DELETE',
      }));

      const data = await response.json();
      if (response.ok) {
        setSuccess('Account deactivated. You will be logged out.');
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    }
  };

  const handleOpenChangePassword = () => {
    setIsChangePasswordOpen(true);
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Account Settings</h1>
          <p className="text-sm text-[var(--gray-600)] mt-1">Manage your account preferences and business settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="btn-primary btn-md min-w-[120px] flex items-center justify-center"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-[var(--error-red-light)] border border-[var(--error-red-border)] rounded-lg p-4">
          <p className="text-[var(--error-red)]">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-[var(--success-green-light)] border border-[var(--success-green-border)] rounded-lg p-4">
          <p className="text-[var(--success-green)]">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--gray-300)] rounded-lg p-6">
            <h2 className="section-header mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--gray-300)]">
                <div>
                  <p className="font-medium text-[var(--navy-blue)]">Email Notifications</p>
                  <p className="text-sm text-[var(--gray-600)]">Receive important updates via email</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-[var(--primary-teal)]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle email notifications"
                >
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[var(--gray-300)]">
                <div>
                  <p className="font-medium text-[var(--navy-blue)]">Order Notifications</p>
                  <p className="text-sm text-[var(--gray-600)]">Alerts for new orders and status changes</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.orderNotifications ? 'bg-[var(--primary-teal)]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle order notifications"
                >
                  <input
                    type="checkbox"
                    checked={settings.orderNotifications}
                    onChange={() => handleToggle('orderNotifications')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.orderNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[var(--gray-300)]">
                <div>
                  <p className="font-medium text-[var(--navy-blue)]">Low Stock Alerts</p>
                  <p className="text-sm text-[var(--gray-600)]">Get notified when inventory is running low</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.lowStockAlerts ? 'bg-[var(--primary-teal)]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle low stock alerts"
                >
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlerts}
                    onChange={() => handleToggle('lowStockAlerts')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[var(--gray-300)]">
                <div>
                  <p className="font-medium text-[var(--navy-blue)]">Review Notifications</p>
                  <p className="text-sm text-[var(--gray-600)]">Alerts for new customer reviews</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reviewNotifications ? 'bg-[var(--primary-teal)]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle review notifications"
                >
                  <input
                    type="checkbox"
                    checked={settings.reviewNotifications}
                    onChange={() => handleToggle('reviewNotifications')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reviewNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[var(--navy-blue)]">Marketing Emails</p>
                  <p className="text-sm text-[var(--gray-600)]">Receive promotional offers and updates</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.marketingEmails ? 'bg-[var(--primary-teal)]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle marketing emails"
                >
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={() => handleToggle('marketingEmails')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[var(--gray-300)] rounded-lg p-6">
            <h2 className="section-header mb-6">Business Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Default Shipping Method
                </label>
                <select
                  value={settings.defaultShippingMethod}
                  onChange={(e) => handleSelect('defaultShippingMethod', e.target.value)}
                  className="select-field"
                  aria-label="Select default shipping method"
                >
                  <option value="standard">Standard Shipping</option>
                  <option value="express">Express Shipping</option>
                  <option value="pickup">Store Pickup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  Return Policy
                </label>
                <select
                  value={settings.returnPolicy}
                  onChange={(e) => handleSelect('returnPolicy', e.target.value)}
                  className="select-field"
                  aria-label="Select return policy"
                >
                  <option value="7-days">7 Days</option>
                  <option value="15-days">15 Days</option>
                  <option value="30-days">30 Days</option>
                  <option value="no-returns">No Returns</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-[#e2d4b7]">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Auto-confirm Orders</p>
                  <p className="text-sm text-[#6b7280]">Automatically accept new orders</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoConfirmOrders ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle auto-confirm orders"
                >
                  <input
                    type="checkbox"
                    checked={settings.autoConfirmOrders}
                    onChange={() => handleToggle('autoConfirmOrders')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoConfirmOrders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#1f3b2c]">Tax Inclusive Prices</p>
                  <p className="text-sm text-[#6b7280]">Show prices including tax</p>
                </div>
                <label
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.taxInclusive ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle tax inclusive prices"
                >
                  <input
                    type="checkbox"
                    checked={settings.taxInclusive}
                    onChange={() => handleToggle('taxInclusive')}
                    className="sr-only"
                  />
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.taxInclusive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                  GST Rate (%)
                </label>
                <select
                  value={(settings.taxRate * 100).toString()}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value || '0');
                    setSettings(prev => ({
                      ...prev,
                      taxRate: isNaN(value) ? 0 : value / 100,
                    }));
                  }}
                  className="select-field"
                  aria-label="Select GST rate"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-[var(--gray-300)] rounded-lg p-6">
        <h2 className="section-header mb-6">Security Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--gray-300)]">
              <div>
                <p className="font-medium text-[#1f3b2c]">Two-Factor Authentication</p>
                <p className="text-sm text-[#6b7280]">Add an extra layer of security</p>
              </div>
              <label
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorAuth ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                }`}
                aria-label="Toggle two-factor authentication"
              >
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  className="sr-only"
                />
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                Session Timeout
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSelect('sessionTimeout', e.target.value)}
                className="select-field"
                aria-label="Select session timeout"
              >
                <option value="1h">1 Hour</option>
                <option value="8h">8 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <button
              className="w-full btn-secondary btn-md"
              aria-label="Change password"
              onClick={handleOpenChangePassword}
            >
              Change Password
            </button>
            <button
              className="w-full btn-secondary btn-md"
              aria-label="Download my data"
              onClick={handleDownloadData}
            >
              Download My Data
            </button>
            <button
              className="w-full btn-destructive btn-md"
              aria-label="Delete account"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <button
                className="text-sm text-[var(--gray-500)] hover:text-[var(--gray-700)]"
                onClick={() => !changingPassword && setIsChangePasswordOpen(false)}
              >
                Close
              </button>
            </div>

            {changePasswordError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {changePasswordError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--gray-700)]">
                  Current Password
                </label>
                <input
                  type="password"
                  className="input input-md w-full"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={changingPassword}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--gray-700)]">
                  New Password
                </label>
                <input
                  type="password"
                  className="input input-md w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changingPassword}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                className="btn-secondary btn-md"
                onClick={() => !changingPassword && setIsChangePasswordOpen(false)}
                disabled={changingPassword}
              >
                Cancel
              </button>
              <button
                className="btn-primary btn-md min-w-[120px] flex items-center justify-center"
                onClick={handleSubmitChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
