"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SellerProfile {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber?: string;
  avatarUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documents: {
    businessCertificate?: string;
    tradeLicense?: string;
    ownerIdProof?: string;
    gstCertificate?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    gstNumber: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/seller', {
        headers: {
          'x-seller-id': 'temp-seller-id' // TODO: Get from auth
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      const profileData = data.seller;
      
      setProfile(profileData);
      setFormData({
        companyName: profileData.companyName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        gstNumber: profileData.gstNumber || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/seller', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-seller-id': 'temp-seller-id'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        await loadProfile(); // Reload profile
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#6b7280]">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#6b7280]">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f3b2c]">Profile Settings</h1>
          <p className="text-sm text-[#6b7280] mt-1">Manage your business information and account settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/supplier/profile/verification"
            className="inline-flex items-center justify-center rounded-md border border-[#e2d4b7] px-4 py-2 text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]"
          >
            Verification Documents
          </Link>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center rounded-md bg-[#1f3b2c] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d4f3c]"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#1f3b2c]">Business Information</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getVerificationStatusColor(profile.verificationStatus)}`}>
                {profile.verificationStatus === 'verified' ? 'Verified' : profile.verificationStatus === 'pending' ? 'Pending Verification' : 'Not Verified'}
              </span>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      Business Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      GST Number
                    </label>
                    <input
                      id="gstNumber"
                      name="gstNumber"
                      type="text"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                    Business Address *
                  </label>
                  <div className="space-y-4">
                    <input
                      name="address.street"
                      type="text"
                      required
                      value={formData.address.street}
                      onChange={handleInputChange}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        name="address.city"
                        type="text"
                        required
                        value={formData.address.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                      />
                      <input
                        name="address.state"
                        type="text"
                        required
                        value={formData.address.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                      />
                      <input
                        name="address.pincode"
                        type="text"
                        required
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                        className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      loadProfile(); // Reset form
                    }}
                    className="inline-flex items-center justify-center rounded-md border border-[#e2d4b7] px-4 py-2 text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-[#1f3b2c] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d4f3c]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">Company Name</p>
                    <p className="text-[#1f3b2c]">{profile.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">Business Email</p>
                    <p className="text-[#1f3b2c]">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">Phone Number</p>
                    <p className="text-[#1f3b2c]">{profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">GST Number</p>
                    <p className="text-[#1f3b2c]">{profile.gstNumber || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#6b7280] mb-2">Business Address</p>
                  <p className="text-[#1f3b2c]">
                    {profile.address.street}<br />
                    {profile.address.city}, {profile.address.state} {profile.address.pincode}<br />
                    {profile.address.country}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Account Status Card */}
            <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#1f3b2c] mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6b7280]">Verification</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getVerificationStatusColor(profile.verificationStatus)}`}>
                    {profile.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6b7280]">Account Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6b7280]">Member Since</span>
                  <span className="text-sm text-[#1f3b2c]">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[#e2d4b7] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#1f3b2c] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/supplier/profile/verification"
                  className="block w-full text-center px-4 py-2 border border-[#e2d4b7] rounded-md text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]"
                >
                  Upload Documents
                </Link>
                <Link
                  href="/dashboard/supplier/settings"
                  className="block w-full text-center px-4 py-2 border border-[#e2d4b7] rounded-md text-sm font-medium text-[#1f3b2c] hover:bg-[#f9fafb]"
                >
                  Account Settings
                </Link>
                <button className="block w-full text-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
