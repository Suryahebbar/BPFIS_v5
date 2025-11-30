"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [landDetails, setLandDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/farmer/kyc');
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to load profile');
        } else {
          setProfile(data.profile);
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    async function loadLandDetails() {
      try {
        // Get userId from localStorage or URL
        const userId = localStorage.getItem('userId') || new URLSearchParams(window.location.search).get('userId');
        if (!userId) return;

        const res = await fetch(`/api/farmer/land-details?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setLandDetails(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load land details:', err);
      }
    }
    loadLandDetails();
  }, []);

  return (
    <div className="space-y-6 text-xs md:text-sm">
      <h1 className="text-xl font-semibold text-[#1f3b2c] mb-2">My Profile</h1>

      {loading && <p className="text-[#6b7280]">Loading profile…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {profile && (
        <>
          <section className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6 space-y-2">
            <h2 className="text-sm font-semibold text-[#1f3b2c] mb-2">Farmer Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-[#1f3b2c]"><span className="font-semibold">Aadhaar Name: </span>{profile.aadhaarKannadaName || profile.verifiedName || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Age &amp; Gender: </span>{profile.age ? `${profile.age}, ` : ''}{profile.gender || '' || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Home Address: </span>{profile.homeAddress || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">ID Proof: </span>{profile.idProof || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Contact Number: </span>{profile.contactNumber || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Date of Birth: </span>{profile.dob || '—'}</div>
              {profile.nameVerificationStatus && (
                <div className="text-[#1f3b2c]">
                  <span className="font-semibold">Name Verification: </span>
                  <span className={`font-bold ${
                    profile.nameVerificationStatus === 'verified' ? 'text-green-700' :
                    profile.nameVerificationStatus === 'not_verified' ? 'text-red-700' :
                    'text-yellow-700'
                  }`}>
                    {profile.nameVerificationStatus === 'verified' ? '✅ Verified' :
                     profile.nameVerificationStatus === 'not_verified' ? '❌ Not Verified' :
                     '⏳ Pending'}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6 space-y-2">
            <h2 className="text-sm font-semibold text-[#1f3b2c] mb-2">Aadhaar Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-[#1f3b2c]"><span className="font-semibold">Aadhaar Number: </span>{profile.idProof || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Mobile Number: </span>{profile.contactNumber || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Date of Birth: </span>{profile.dob || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Gender: </span>{profile.gender || '—'}</div>
              <div className="text-[#1f3b2c]"><span className="font-semibold">Address: </span>{profile.homeAddress || '—'}</div>
            </div>
          </section>

          {/* Land Details Section */}
          <section className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6 space-y-2">
            <h2 className="text-sm font-semibold text-[#1f3b2c] mb-2">Land Details</h2>
            {profile.nameVerificationStatus === 'verified' && profile.landParcelIdentity ? (
              // Show land details if names matched and RTC data is available
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="text-[#1f3b2c]"><span className="font-semibold">Survey Number: </span>{profile.landParcelIdentity || '—'}</div>
                <div className="text-[#1f3b2c]"><span className="font-semibold">Total Area: </span>{profile.totalCultivableArea || '—'}</div>
                <div className="text-[#1f3b2c]"><span className="font-semibold">Soil Type: </span>{profile.soilProperties || '—'}</div>
                <div className="text-[#1f3b2c]"><span className="font-semibold">Mutation: </span>{profile.mutationTraceability || '—'}</div>
                {profile.rtcAddress && (
                  <div className="text-[#1f3b2c]"><span className="font-semibold">Land Location: </span>{profile.rtcAddress}</div>
                )}
                <div className="text-[#1f3b2c]">
                  <span className="font-semibold">Ownership Verified: </span>
                  <span className="font-bold text-green-700">✅ Yes</span>
                </div>
              </div>
            ) : (
              // Show upload button if names don't match or no RTC data
              <div className="text-center py-4">
                <p className="text-[#1f3b2c] mb-4">
                  {profile.nameVerificationStatus === 'not_verified' 
                    ? 'Names did not match. Please upload matching RTC and Aadhaar documents to view land details.'
                    : 'No land details available. Please upload your RTC document.'}
                </p>
                <button
                  onClick={() => router.push('/dashboard/farmer/documents')}
                  className="inline-flex items-center rounded-md bg-[#166534] px-4 py-2 text-xs font-medium text-white hover:bg-[#14532d]"
                >
                  Upload RTC Document
                </button>
              </div>
            )}
          </section>

          {/* Mapped Land Details Section */}
          {landDetails.length > 0 && (
            <section className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6 space-y-4">
              <h2 className="text-sm font-semibold text-[#1f3b2c] mb-4">Mapped Land Details</h2>
              {landDetails.map((land, index) => (
                <div key={land._id} className="border border-[#e2d4b7] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#1f3b2c">Land Parcel #{index + 1}</h3>
                    <span className={`px-2 py-1 rounded-full text-[11px] ${
                      land.processingStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      land.processingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {land.processingStatus === 'completed' ? '✅ Mapped' : 
                       land.processingStatus === 'pending' ? '⏳ Pending' : 
                       '❌ Failed'}
                    </span>
                  </div>

                  {/* Land Sketch Image */}
                  {land.sketchImage && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#1f3b2c]">Land Sketch</h4>
                      <img 
                        src={land.sketchImage.path} 
                        alt="Land Sketch" 
                        className="w-full max-w-xs h-auto border border-[#e2d4b7] rounded-lg"
                      />
                    </div>
                  )}

                  {/* RTC Details */}
                  {land.rtcDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="text-[#1f3b2c]">
                        <span className="font-semibold">Survey Number: </span>
                        {land.rtcDetails.surveyNumber || '—'}
                      </div>
                      <div className="text-[#1f3b2c]">
                        <span className="font-semibold">Extent: </span>
                        {land.rtcDetails.extent ? `${land.rtcDetails.extent} acres` : '—'}
                      </div>
                      <div className="text-[#1f3b2c]">
                        <span className="font-semibold">Location: </span>
                        {land.rtcDetails.location || '—'}
                      </div>
                      <div className="text-[#1f3b2c]">
                        <span className="font-semibold">Soil Type: </span>
                        {land.rtcDetails.soilType || '—'}
                      </div>
                    </div>
                  )}

                  {/* Geographic Coordinates */}
                  {land.landData && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#1f3b2c]">Geographic Coordinates</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#1f3b2c]">
                        <div>
                          <span className="font-semibold">Centroid: </span>
                          {land.landData.centroidLatitude?.toFixed(7)}, {land.landData.centroidLongitude?.toFixed(7)}
                        </div>
                        <div>
                          <span className="font-semibold">Total Area: </span>
                          {land.landData.totalArea ? `${land.landData.totalArea.toFixed(2)} sq.m` : '—'}
                        </div>
                        <div>
                          <span className="font-semibold">Vertices: </span>
                          {land.landData.vertices?.length || 0} points
                        </div>
                        <div>
                          <span className="font-semibold">Side Lengths: </span>
                          {land.landData.sideLengths?.length || 0} sides
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download GeoJSON */}
                  {land.landData?.geojson && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          const blob = new Blob([land.landData.geojson], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `land-parcel-${index + 1}.geojson`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center rounded-md bg-[#166534] px-3 py-1 text-xs font-medium text-white hover:bg-[#14532d]"
                      >
                        Download GeoJSON
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          <section className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[#1f3b2c] mb-2">Uploaded Documents</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[#1f3b2c]">RTC Document</span>
                <span className={`px-2 py-1 rounded-full text-[11px] ${profile.rtcOcrText ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                  {profile.rtcOcrText ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#1f3b2c]">Aadhaar Document</span>
                <span className={`px-2 py-1 rounded-full text-[11px] ${profile.aadharOcrText ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                  {profile.aadharOcrText ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
