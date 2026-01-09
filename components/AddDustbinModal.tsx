'use client';

import React, { useState } from 'react';
import { X, MapPin, Plus } from 'lucide-react';
import { createDustbin } from '@/lib/firebase';

interface AddDustbinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddDustbinModal: React.FC<AddDustbinModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    location: 'MP Nagar Zone 1',
    address: 'Near DB Mall, Main Road',
    latitude: 23.2599,
    longitude: 77.4126,
    zone: 'Zone-A',
    capacity: 100,
    fillLevel: 0
  });

  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'capacity' || name === 'fillLevel'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDustbin({
        id: formData.id,
        location: formData.location,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        zone: formData.zone,
        capacity: formData.capacity,
        fillLevel: formData.fillLevel,
        status: formData.fillLevel >= 80 ? 'critical' : formData.fillLevel >= 50 ? 'warning' : 'normal',
        lastUpdated: new Date().toISOString()
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating dustbin:', error);
      alert('Failed to add dustbin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Add New Dustbin</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Dustbin ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Dustbin ID *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
                placeholder="e.g., BIN005"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Location Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Location Name *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
              />
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
              />
            </div>

            {/* Coordinates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Zone *
              </label>
              <select
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900 appearance-none"
              >
                <option value="Zone-A">Zone A (Central)</option>
                <option value="Zone-B">Zone B (Residential)</option>
                <option value="Zone-C">Zone C (Commercial)</option>
                <option value="Zone-D">Zone D (Industrial)</option>
              </select>
            </div>

            {/* Capacity & Fill Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Capacity (L)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Initial Fill Level (%)
                </label>
                <input
                  type="number"
                  name="fillLevel"
                  value={formData.fillLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Current Location Button */}
          <div className="mt-6 mb-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              <MapPin className="w-4 h-4" />
              {useCurrentLocation ? 'Location Updated!' : 'Use My Current Location'}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.id}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Dustbin
                </>
              )}
            </button>
          </div>

          {/* Status Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm font-medium text-gray-800 mb-1">Preview Status:</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                formData.fillLevel >= 80 ? 'bg-red-500' :
                formData.fillLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-sm text-gray-700">
                {formData.fillLevel >= 80 ? 'Critical' :
                 formData.fillLevel >= 50 ? 'Warning' : 'Normal'}
                {' - '}{formData.fillLevel}% full
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDustbinModal;