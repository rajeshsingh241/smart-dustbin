'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Navigation, CheckCircle2 } from 'lucide-react';
import type { Dustbin } from '@/types/dustbin';

interface BusRouteOptimizerProps {
  dustbins: Dustbin[];
}

// Haversine formula to calculate distance in km between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Nearest-neighbor greedy algorithm for route optimization
function optimizeRoute(bins: Dustbin[], startLat: number, startLon: number): Dustbin[] {
  const remaining = [...bins];
  const route: Dustbin[] = [];
  let currentLat = startLat;
  let currentLon = startLon;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((bin, idx) => {
      const dist = calculateDistance(currentLat, currentLon, bin.latitude, bin.longitude);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });

    const nearest = remaining.splice(nearestIdx, 1)[0];
    route.push(nearest);
    currentLat = nearest.latitude;
    currentLon = nearest.longitude;
  }

  return route;
}

export default function BusRouteOptimizer({ dustbins }: BusRouteOptimizerProps) {
  // Municipal depot — city centre of Bhopal
  const DEPOT_LAT = 23.2599;
  const DEPOT_LON = 77.4126;
  const DEPOT_NAME = 'Municipal Corporation Depot';

  const [optimizedRoute, setOptimizedRoute] = useState<Dustbin[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStop, setCurrentStop] = useState<number>(-1); // -1 = at depot, -2 = returned
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Only critical and warning bins need collection
  const binsToVisit = dustbins.filter(
    (b) => b.status === 'critical' || b.status === 'warning',
  );

  // Recalculate optimised route whenever dustbins change
  useEffect(() => {
    if (binsToVisit.length === 0) {
      setOptimizedRoute([]);
      setTotalDistance(0);
      return;
    }

    const route = optimizeRoute(binsToVisit, DEPOT_LAT, DEPOT_LON);
    setOptimizedRoute(route);

    // Total round-trip distance
    let dist = calculateDistance(DEPOT_LAT, DEPOT_LON, route[0].latitude, route[0].longitude);
    for (let i = 0; i < route.length - 1; i++) {
      dist += calculateDistance(
        route[i].latitude,
        route[i].longitude,
        route[i + 1].latitude,
        route[i + 1].longitude,
      );
    }
    dist += calculateDistance(
      route[route.length - 1].latitude,
      route[route.length - 1].longitude,
      DEPOT_LAT,
      DEPOT_LON,
    );
    setTotalDistance(dist);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dustbins]);

  // Elapsed-time ticker
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const startRoute = () => {
    setIsRunning(true);
    setCurrentStop(0);
    setCompletedStops(new Set());
    setElapsedTime(0);

    // Simulate arriving at each stop (3 s per stop for demo)
    optimizedRoute.forEach((bin, idx) => {
      setTimeout(() => {
        setCurrentStop(idx);
        setCompletedStops((prev) => {
          const next = new Set(prev);
          if (idx > 0) next.add(optimizedRoute[idx - 1].id);
          return next;
        });
      }, (idx + 1) * 3000);
    });

    // Return to depot
    setTimeout(() => {
      setCurrentStop(-2);
      setCompletedStops(new Set(optimizedRoute.map((b) => b.id)));
      setIsRunning(false);
    }, (optimizedRoute.length + 1) * 3000);
  };

  const resetRoute = () => {
    setIsRunning(false);
    setCurrentStop(-1);
    setCompletedStops(new Set());
    setElapsedTime(0);
  };

  const openInGoogleMaps = () => {
    if (optimizedRoute.length === 0) return;
    const waypoints = optimizedRoute
      .map((b) => `${b.latitude},${b.longitude}`)
      .join('/');
    const url = `https://www.google.com/maps/dir/${DEPOT_LAT},${DEPOT_LON}/${waypoints}/${DEPOT_LAT},${DEPOT_LON}`;
    window.open(url, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (binsToVisit.length === 0) {
    return (
      <div className="text-center py-16">
        <Truck className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
          All bins are at normal levels!
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          No collection needed right now. Check back when bins become critical or warning.
        </p>
      </div>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Info banner ── */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-300">
              Optimized Route — Nearest Neighbor Algorithm
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
              Route is calculated greedily: the bus always travels to the closest un-visited
              bin next, minimising total travel distance.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Stops
          </p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
            {optimizedRoute.length}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
            Total Distance
          </p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">
            {totalDistance.toFixed(1)} km
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
            Collected
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">
            {completedStops.size}/{optimizedRoute.length}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
            Elapsed Time
          </p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
            {formatTime(elapsedTime)}
          </p>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        {!isRunning && currentStop === -1 && (
          <button
            onClick={startRoute}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 font-medium transition-colors shadow-sm"
          >
            <Truck className="w-5 h-5" />
            Start Route Simulation
          </button>
        )}

        {(isRunning || currentStop !== -1) && (
          <button
            onClick={resetRoute}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 font-medium transition-colors shadow-sm"
          >
            Reset Route
          </button>
        )}

        <button
          onClick={openInGoogleMaps}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors shadow-sm"
        >
          <Navigation className="w-5 h-5" />
          Open Full Route in Google Maps
        </button>
      </div>

      {/* ── Route visualisation ── */}
      <div className="space-y-1">
        {/* Depot — START */}
        <div
          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
            currentStop === -1 && isRunning
              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}
        >
          <div className="w-9 h-9 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
            🏭
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-green-900 dark:text-green-300">{DEPOT_NAME}</p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Departure point &nbsp;|&nbsp; {DEPOT_LAT}, {DEPOT_LON}
            </p>
          </div>
          {currentStop === -1 && !isRunning && completedStops.size === 0 && (
            <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-full">
              Ready
            </span>
          )}
          {currentStop === -1 && isRunning && (
            <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
              <Truck className="w-5 h-5 animate-bounce" />
              <span className="text-sm font-medium">Departing…</span>
            </div>
          )}
        </div>

        {/* Route stops */}
        {optimizedRoute.map((bin, idx) => {
          const isCompleted = completedStops.has(bin.id);
          const isCurrent = currentStop === idx;

          const distFromPrev =
            idx === 0
              ? calculateDistance(DEPOT_LAT, DEPOT_LON, bin.latitude, bin.longitude)
              : calculateDistance(
                  optimizedRoute[idx - 1].latitude,
                  optimizedRoute[idx - 1].longitude,
                  bin.latitude,
                  bin.longitude,
                );

          return (
            <div key={bin.id}>
              {/* Connector with distance */}
              <div className="flex items-center gap-2 pl-5 py-1">
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ↓ {distFromPrev.toFixed(2)} km
                </span>
              </div>

              {/* Stop card */}
              <div
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-md'
                    : isCompleted
                    ? 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 opacity-60'
                    : bin.status === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                {/* Step number / check */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 text-white ${
                    isCompleted
                      ? 'bg-gray-400 dark:bg-gray-500'
                      : isCurrent
                      ? 'bg-blue-600 dark:bg-blue-700'
                      : bin.status === 'critical'
                      ? 'bg-red-600 dark:bg-red-700'
                      : 'bg-yellow-500 dark:bg-yellow-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {bin.location}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        bin.status === 'critical'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {bin.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {bin.address} &nbsp;·&nbsp; {bin.zone}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    Fill: <span className="font-medium">{bin.fillLevel}%</span>
                    &nbsp;·&nbsp; ID: {bin.id}
                    &nbsp;·&nbsp; {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
                  </p>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Truck className="w-5 h-5 animate-bounce" />
                      <span className="text-sm font-medium hidden sm:inline">Collecting…</span>
                    </div>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      ✓ Done
                    </span>
                  )}
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${bin.latitude},${bin.longitude}`,
                        '_blank',
                      )
                    }
                    title="View bin on Google Maps"
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Return connector + Depot END */}
        {optimizedRoute.length > 0 && (
          <>
            <div className="flex items-center gap-2 pl-5 py-1">
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ↓{' '}
                {calculateDistance(
                  optimizedRoute[optimizedRoute.length - 1].latitude,
                  optimizedRoute[optimizedRoute.length - 1].longitude,
                  DEPOT_LAT,
                  DEPOT_LON,
                ).toFixed(2)}{' '}
                km back to depot
              </span>
            </div>

            <div
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                currentStop === -2
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow'
                  : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="w-9 h-9 bg-gray-500 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                🏭
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-700 dark:text-gray-300">{DEPOT_NAME}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Return to base</p>
              </div>
              {currentStop === -2 && (
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Route Complete!</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
