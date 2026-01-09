'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Dustbin } from '@/types/dustbin';

interface NearestDustbinProps {
  dustbins: Dustbin[];
}

export default function NearestDustbin({ dustbins }: NearestDustbinProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestBin, setNearestBin] = useState<Dustbin | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setPermissionDenied(false);
          findNearestBin(userLoc);
        },
        (error) => {
          console.error('Location error:', error);
          setPermissionDenied(true);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const findNearestBin = (userLoc: { lat: number; lng: number }) => {
    if (dustbins.length === 0) return;

    let nearest = dustbins[0];
    let minDistance = calculateDistance(
      userLoc.lat,
      userLoc.lng,
      dustbins[0].latitude,
      dustbins[0].longitude
    );

    dustbins.forEach(bin => {
      const dist = calculateDistance(
        userLoc.lat,
        userLoc.lng,
        bin.latitude,
        bin.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = bin;
      }
    });

    setNearestBin(nearest);
    setDistance(minDistance);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Find Nearest Dustbin</h3>
        <button
          onClick={requestLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Get My Location
        </button>
      </div>

      {permissionDenied && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Location permission denied. Please enable location access in your browser settings.
          </p>
        </div>
      )}

      {userLocation && nearestBin && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Nearest Dustbin: {nearestBin.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{nearestBin.location}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{nearestBin.address}</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                📍 {distance?.toFixed(2)} km away
              </p>
              <button
                onClick={() => window.open(
                  `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestBin.latitude},${nearestBin.longitude}`,
                  '_blank'
                )}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>
      )}

      {userLocation && dustbins.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No dustbins found in the system.</p>
      )}
    </div>
  );
}