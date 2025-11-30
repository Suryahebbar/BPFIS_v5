"use client";

import { useState } from 'react';

export default function LandIntegrationPage() {
  const [showLandDetailModal, setShowLandDetailModal] = useState(false);
  const [showNeighborModal, setShowNeighborModal] = useState(false);
  const [landDetails, setLandDetails] = useState({
    surveyNumber: '',
    extent: '',
    location: '',
    soilType: '',
    cropType: ''
  });
  const [neighborRequest, setNeighborRequest] = useState({
    neighborName: '',
    neighborContact: '',
    neighborLand: '',
    integrationType: '',
    duration: ''
  });

  const handleLandDetailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Land details submitted:', landDetails);
    setShowLandDetailModal(false);
    setLandDetails({
      surveyNumber: '',
      extent: '',
      location: '',
      soilType: '',
      cropType: ''
    });
  };

  const handleNeighborRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Neighbor integration request submitted:', neighborRequest);
    setShowNeighborModal(false);
    setNeighborRequest({
      neighborName: '',
      neighborContact: '',
      neighborLand: '',
      integrationType: '',
      duration: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1f3b2c]">Land Integration</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Manage your land details and integration agreements with neighboring farmers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[#1f3b2c] mb-2">Enter Land Details</h2>
          <p className="text-xs text-[#6b7280] mb-4">
            Add and manage your land information including survey number and location details.
          </p>
          <a
            href="/dashboard/farmer/land/details"
            className="inline-flex items-center justify-center rounded-md bg-[#166534] px-4 py-2 text-xs font-medium text-white hover:bg-[#14532d]"
          >
            Add Land Details
          </a>
        </div>
        
        <div className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[#1f3b2c] mb-2">Apply for Integration</h2>
          <p className="text-xs text-[#6b7280] mb-4">
            Request land integration with neighboring farmers for collaborative farming.
          </p>
          <button
            onClick={() => setShowNeighborModal(true)}
            className="inline-flex items-center justify-center rounded-md bg-[#166534] px-4 py-2 text-xs font-medium text-white hover:bg-[#14532d]"
          >
            Send Request
          </button>
        </div>

        <div className="bg-[#fffaf1] border border-[#e2d4b7] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[#1f3b2c] mb-2">View Agreements</h2>
          <p className="text-xs text-[#6b7280] mb-4">
            Check status of your existing land integration agreements with other farmers.
          </p>
          <button className="inline-flex items-center justify-center rounded-md bg-[#166534] px-4 py-2 text-xs font-medium text-white hover:bg-[#14532d]">
            View All
          </button>
        </div>
      </div>

      {/* Land Details Modal */}
      {showLandDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1f3b2c]">Enter Land Details</h3>
              <button
                onClick={() => setShowLandDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLandDetailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-1">
                  Survey Number
                </label>
                <input
                  type="text"
                  value={landDetails.surveyNumber}
                  onChange={(e) => setLandDetails({...landDetails, surveyNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  placeholder="e.g., 24/1A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-1">
                  Land Extent (acres)
                </label>
                <input
                  type="text"
                  value={landDetails.extent}
                  onChange={(e) => setLandDetails({...landDetails, extent: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  placeholder="e.g., 2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={landDetails.location}
                  onChange={(e) => setLandDetails({...landDetails, location: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  placeholder="Village, Hobli, Taluk"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLandDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-[#e2d4b7] text-[#1f3b2c] rounded-md hover:bg-[#f7f0de]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#166534] text-white rounded-md hover:bg-[#14532d]"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Neighbor Integration Modal */}
      {showNeighborModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1f3b2c]">Apply for Land Integration</h3>
              <button
                onClick={() => setShowNeighborModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleNeighborRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-1">
                  Neighbor Farmer Name
                </label>
                <input
                  type="text"
                  value={neighborRequest.neighborName}
                  onChange={(e) => setNeighborRequest({...neighborRequest, neighborName: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  placeholder="Enter neighbor's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={neighborRequest.neighborContact}
                  onChange={(e) => setNeighborRequest({...neighborRequest, neighborContact: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  placeholder="Mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f3b2c] mb-1">
                  Integration Type
                </label>
                <select
                  value={neighborRequest.integrationType}
                  onChange={(e) => setNeighborRequest({...neighborRequest, integrationType: e.target.value})}
                  className="w-full px-3 py-2 border border-[#e2d4b7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  required
                >
                  <option value="">Select integration type</option>
                  <option value="joint_farming">Joint Farming</option>
                  <option value="resource_sharing">Resource Sharing</option>
                  <option value="crop_rotation">Crop Rotation</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNeighborModal(false)}
                  className="flex-1 px-4 py-2 border border-[#e2d4b7] text-[#1f3b2c] rounded-md hover:bg-[#f7f0de]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#166534] text-white rounded-md hover:bg-[#14532d]"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
