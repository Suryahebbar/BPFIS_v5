'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  basicInfo?: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
    isVerified: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  profileData?: {
    profileName?: string;
    scheme_name?: string;
    official_link?: string;
    land_size?: string;
    farmer_category?: string;
    location_state?: string;
    location_district?: string;
    location_taluk?: string;
    village_rtc_data?: string;
    crop_type?: string;
    season?: string;
    irrigation_type?: string;
    water_source_capacity?: string;
    organic_certification?: string;
    farmer_age?: string;
    gender?: string;
    income_catogory?: string;
    pm_kisan_registration?: string;
    equipment_ownership?: string;
    fpo_membership?: string;
    insurance_status_pmfby?: string;
    disaster_affected_region?: string;
    soil_type?: string;
    isActive?: boolean;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  schemeSearchResults?: Array<{
    eligibleSchemes: Array<{
      name: string;
      link?: string;
      raw: Record<string, any>;
    }>;
    count: number;
    searchedAt: string;
  }>;
  statistics?: {
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  orders?: Array<{
    _id: string;
    total: number;
    status: string;
    paymentStatus?: string;
    createdAt: string;
    updatedAt: string;
    items?: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      total: number;
    }>;
  }>;
}

export default function FarmerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/farmers/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch farmer details');
        }

        const data = await response.json();
        setFarmer(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        console.error('Error fetching farmer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [resolvedParams.id]);

  const handleVerify = async () => {
    try {
      const response = await fetch(`/api/admin/farmers/${resolvedParams.id}/verify`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to verify farmer');
      }

      // Refresh farmer data
      const updatedFarmer = await response.json();
      setFarmer(updatedFarmer.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify farmer');
      console.error('Error verifying farmer:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-8 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="mt-2 text-lg font-medium text-gray-900">Farmer not found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested farmer could not be found.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/admin/farmers')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Farmers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/farmers')}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Farmer Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and account information
              </p>
            </div>
            <div className="flex space-x-3">
              {!farmer.isVerified && (
                <button
                  onClick={handleVerify}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Verify Account
                </button>
              )}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  farmer.isVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {farmer.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {farmer.name}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {farmer.email}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {farmer.phone || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {farmer.address || 'Not provided'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(farmer.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Farmer Profile Details Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Complete Farmer Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Comprehensive farmer information including scheme details
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {/* Basic Information */}
              <div className="py-4 sm:py-5">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{farmer.basicInfo?.fullName || farmer.name}</dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{farmer.basicInfo?.email || farmer.email}</dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{farmer.basicInfo?.phone || farmer.phone || 'Not provided'}</dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{farmer.basicInfo?.address || farmer.address || 'Not provided'}</dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (farmer.basicInfo?.isVerified ?? farmer.isVerified)
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(farmer.basicInfo?.isVerified ?? farmer.isVerified) ? 'Verified' : 'Not Verified'}
                      </span>
                    </dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                    <dd className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        farmer.basicInfo?.emailVerified
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {farmer.basicInfo?.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Phone Verified</dt>
                    <dd className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        farmer.basicInfo?.phoneVerified
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {farmer.basicInfo?.phoneVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </dd>
                  </div>
                  <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(farmer.basicInfo?.createdAt || farmer.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Scheme Profile Information */}
              {farmer.profileData && (
                <div className="py-4 sm:py-5">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Scheme Profile Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Profile Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.profileName || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Scheme Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.scheme_name || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Land Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.land_size || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Farmer Category</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.farmer_category || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Location State</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.location_state || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Location District</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.location_district || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Village/RTC</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.village_rtc_data || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Crop Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.crop_type || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Season</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.season || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Irrigation Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.irrigation_type || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Water Source Capacity</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.water_source_capacity || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Organic Certification</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.organic_certification || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Farmer Age</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.farmer_age || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.gender || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Income Category</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.income_catogory || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">PM Kisan Registration</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.pm_kisan_registration || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Equipment Ownership</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.equipment_ownership || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">FPO Membership</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.fpo_membership || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Insurance Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.insurance_status_pmfby || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Disaster Affected Region</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.disaster_affected_region || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Soil Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{farmer.profileData.soil_type || 'N/A'}</dd>
                    </div>
                    <div className="py-2">
                      <dt className="text-sm font-medium text-gray-500">Official Link</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {farmer.profileData.official_link ? (
                          <a href={farmer.profileData.official_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View Official Document
                          </a>
                        ) : 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheme Search Results */}
              {farmer.schemeSearchResults && farmer.schemeSearchResults.length > 0 && (
                <div className="py-4 sm:py-5">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Scheme Search Results</h4>
                  <div className="space-y-3">
                    {farmer.schemeSearchResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-sm font-medium text-gray-900">
                            Search Result - {new Date(result.searchedAt).toLocaleDateString()}
                          </h5>
                          <span className="text-sm text-gray-500">
                            {result.count} schemes found
                          </span>
                        </div>
                        <div className="space-y-2">
                          {result.eligibleSchemes.map((scheme, schemeIndex) => (
                            <div key={schemeIndex} className="border-l-4 border-green-500 pl-4">
                              <div className="text-sm font-medium text-gray-900">{scheme.name}</div>
                              {scheme.link && (
                                <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                                  View Scheme Details
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Statistics & Analytics</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Complete overview of farmer's performance
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 px-4 py-6 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {farmer.statistics?.totalProducts || 0}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-6 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {farmer.statistics?.totalOrders || 0}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-6 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Completed Orders</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {farmer.statistics?.completedOrders || 0}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-6 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                  {farmer.statistics?.pendingOrders || 0}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-6 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  ₹{(farmer.statistics?.totalRevenue || 0).toFixed(2)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-6 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 truncate">Average Order Value</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  ₹{(farmer.statistics?.averageOrderValue || 0).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Products</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Products listed by this farmer
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {farmer.products && farmer.products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {farmer.products.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : product.status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products found.</p>
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Recent orders from this farmer
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {farmer.orders && farmer.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {farmer.orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order._id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : order.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentStatus || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="max-w-xs">
                            {order.items && order.items.length > 0 ? (
                              <div className="text-xs">
                                {order.items.slice(0, 2).map((item, index) => (
                                  <div key={item.productId} className="mb-1">
                                    {item.name} ({item.quantity}x ₹{item.price})
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <div className="text-gray-400">+{order.items.length - 2} more</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No items</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent orders found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
