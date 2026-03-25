"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  MapPin,
  Bell,
  Send,
  X,
  Check,
  Clock,
  TrendingUp,
  Plus,
  Cpu,
  Truck,
} from "lucide-react";
// Comment out Firebase imports - TEMPORARILY DISABLED
import { listenToDustbinUpdates, createAlert, getAlerts } from "@/lib/firebase";
import type { Dustbin, Alert } from "@/types/dustbin";
import AddDustbinModal from "./AddDustbinModal";
import WasteClassifier from "./WasteClassifier";
import BusRouteOptimizer from "./BusRouteOptimizer";

export default function DashboardContent() {
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "alerts" | "classifier" | "bus-route"
  >("dashboard");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Debug: Check initial state
    console.log("🎨 DashboardContent loading...");
    console.log(
      "🏷️ HTML has dark class?",
      document.documentElement.classList.contains("dark"),
    );

    // Sample data - using mock data instead of Firebase
    const sampleDustbins: Dustbin[] = [
      {
        id: "BIN001",
        location: "MP Nagar Zone 1",
        address: "Near DB Mall, Main Road",
        fillLevel: 85,
        latitude: 23.2599,
        longitude: 77.4126,
        status: "critical",
        lastUpdated: new Date().toISOString(),
        zone: "Zone-A",
      },
      {
        id: "BIN002",
        location: "New Market Area",
        address: "Hamidia Road",
        fillLevel: 65,
        latitude: 23.2637,
        longitude: 77.4085,
        status: "warning",
        lastUpdated: new Date().toISOString(),
        zone: "Zone-B",
      },
      {
        id: "BIN003",
        location: "Railway Station",
        address: "Platform 1 Exit",
        fillLevel: 92,
        latitude: 23.2646,
        longitude: 77.4125,
        status: "critical",
        lastUpdated: new Date().toISOString(),
        zone: "Zone-A",
      },
      {
        id: "BIN004",
        location: "Boat Club",
        address: "Upper Lake Road",
        fillLevel: 35,
        latitude: 23.2494,
        longitude: 77.4094,
        status: "normal",
        lastUpdated: new Date().toISOString(),
        zone: "Zone-C",
      },
      {
        id: "BIN005",
        location: "VIP Road",
        address: "Near Police Station",
        fillLevel: 45,
        latitude: 23.2512,
        longitude: 77.4101,
        status: "normal",
        lastUpdated: new Date().toISOString(),
        zone: "Zone-B",
      },
    ];

    // Sample alerts - using mock data
    const sampleAlerts: Alert[] = [
      {
        id: "alert-001",
        dustbinId: "BIN001",
        location: "MP Nagar Zone 1",
        message: "Critical: Dustbin 85% full",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: "sent",
        sentTo: ["municipal@bhopal.gov.in"],
      },
      {
        id: "alert-002",
        dustbinId: "BIN003",
        location: "Railway Station",
        message: "Critical: Dustbin 92% full",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: "sent",
        sentTo: ["municipal@bhopal.gov.in"],
      },
    ];

    setDustbins(sampleDustbins);
    setAlerts(sampleAlerts);
    setLoading(false);

    // COMMENTED OUT - Firebase real-time listener

    const unsubscribe = listenToDustbinUpdates((data) => {
      if (data) {
        const bins = Object.entries(data).map(
          ([id, binData]: [string, import("@/lib/firebase").DustbinData]) => ({
            id,
            location: binData.location || "Unknown",
            address: binData.address || "",
            fillLevel: binData.fillLevel || 0,
            latitude: binData.latitude || 0,
            longitude: binData.longitude || 0,
            status: binData.status || "normal",
            lastUpdated: binData.lastUpdated || new Date().toISOString(),
            zone: binData.zone || "Unknown",
          }),
        );
        setDustbins(bins);
      }
    });

    loadAlerts();

    return () => unsubscribe();

    // No cleanup needed for mock data
    return () => {};
  }, []);

  // Simulate real-time updates with mock data
  useEffect(() => {
    const interval = setInterval(() => {
      setDustbins((prev) =>
        prev.map((bin) => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const newLevel = Math.max(0, Math.min(100, bin.fillLevel + change));
          const newStatus =
            newLevel >= 80 ? "critical" : newLevel >= 50 ? "warning" : "normal";

          return {
            ...bin,
            fillLevel: newLevel,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
          };
        }),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      // Using mock data instead of Firebase
      console.log("📋 Loading mock alerts data...");
      const mockAlerts: Alert[] = [
        {
          id: "mock-001",
          dustbinId: "BIN001",
          location: "MP Nagar Zone 1",
          message: "Mock alert for testing",
          timestamp: new Date().toISOString(),
          status: "sent",
          sentTo: ["municipal@bhopal.gov.in"],
        },
      ];
      setAlerts(mockAlerts);

      // COMMENTED OUT - Firebase call
      // const alertsData = await getAlerts();
      // setAlerts(alertsData as Alert[]);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
  };

  const sendAlert = async (bin: Dustbin) => {
    try {
      console.log("🚨 Sending alert for:", bin.id);

      // Step 1: Call the real email API first
      const response = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dustbinId: bin.id,
          location: bin.location,
          fillLevel: bin.fillLevel,
          latitude: bin.latitude,
          longitude: bin.longitude,
        }),
      });

      const responseData = await response.json();
      console.log("📧 Alert API response:", responseData);

      // Step 2: Add to local alerts list
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        dustbinId: bin.id,
        location: bin.location,
        message: `Alert sent for ${bin.id} at ${bin.fillLevel}% capacity`,
        timestamp: new Date().toISOString(),
        status: "sent",
        sentTo: ["brownsugar34125@gmail.com"],
      };
      setAlerts((prev) => [newAlert, ...prev]);

      // Step 3: Close modal
      setShowAlertModal(false);
      setSelectedBin(null);

      // Step 4: Show result to user
      if (response.ok) {
        alert(
          `✅ Email alert sent successfully to brownsugar34125@gmail.com!\n\nDustbin: ${bin.id}\nLocation: ${bin.location}\nFill Level: ${bin.fillLevel}%`,
        );
      } else {
        console.error("❌ Email API failed:", responseData);
        alert(
          `⚠️ Alert logged locally but email delivery failed.\n\nError: ${responseData.details || responseData.error || "Unknown error"}\n\nCheck your RESEND_API_KEY in .env.local`,
        );
      }

      // Step 5: Try Firebase (optional — won't block if it fails)
      try {
        await createAlert({
          dustbinId: bin.id,
          location: bin.location,
          message: `Critical alert for ${bin.id}`,
          sentTo: ["brownsugar34125@gmail.com"],
        });
        await loadAlerts();
      } catch (firebaseErr) {
        console.warn(
          "Firebase createAlert skipped (not configured):",
          firebaseErr,
        );
      }
    } catch (error) {
      console.error("Error sending alert:", error);
      setShowAlertModal(false);
      setSelectedBin(null);
      alert(
        "❌ Error sending alert. Check the browser console and your .env.local for RESEND_API_KEY.",
      );
    }
  };

  const criticalBins = dustbins.filter((b) => b.status === "critical").length;
  const avgFillLevel =
    dustbins.length > 0
      ? Math.round(
          dustbins.reduce((acc, b) => acc + b.fillLevel, 0) / dustbins.length,
        )
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
      default:
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      case "warning":
        return <Clock className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Using mock data - Firebase disabled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Dustbin Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Smart Dustbin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Monitor and manage dustbins in real-time
              <span className="text-sm text-amber-600 dark:text-amber-400 ml-2">
                (Using Mock Data)
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Dustbin
          </button>
        </div>

        {/* Development Notice */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-300">
              <strong>Development Mode:</strong> Firebase is temporarily
              disabled. Using mock data for demonstration.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-green-600 dark:bg-green-700 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeTab === "alerts"
                ? "bg-green-600 dark:bg-green-700 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Bell className="w-4 h-4" />
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab("classifier")}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeTab === "classifier"
                ? "bg-indigo-600 dark:bg-indigo-700 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Classifier
          </button>
          <button
            onClick={() => setActiveTab("bus-route")}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              activeTab === "bus-route"
                ? "bg-green-700 dark:bg-green-800 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Truck className="w-4 h-4" />
            Bus Route
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Bins
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {dustbins.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Trash2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Critical Bins
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                      {criticalBins}
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg Fill Level
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {avgFillLevel}%
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Alerts
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {alerts.length}
                    </p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                    <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dustbin Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
              <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Dustbin Status
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (Simulated updates every 5s)
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fill Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {dustbins.map((bin) => (
                      <tr
                        key={bin.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Trash2 className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {bin.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {bin.location}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {bin.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {bin.zone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  bin.fillLevel >= 80
                                    ? "bg-red-500 dark:bg-red-400"
                                    : bin.fillLevel >= 50
                                      ? "bg-yellow-500 dark:bg-yellow-400"
                                      : "bg-green-500 dark:bg-green-400"
                                }`}
                                style={{ width: `${bin.fillLevel}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {bin.fillLevel}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bin.status)}`}
                          >
                            {getStatusIcon(bin.status)}
                            {bin.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(bin.lastUpdated).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps?q=${bin.latitude},${bin.longitude}`,
                                  "_blank",
                                )
                              }
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View on Map"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                            {bin.status === "critical" && (
                              <button
                                onClick={() => {
                                  setSelectedBin(bin);
                                  setShowAlertModal(true);
                                }}
                                className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-sm flex items-center gap-1 transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                Alert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === "alerts" ? (
          /* Alerts Tab */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
            <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alert History
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Mock Data)
                </span>
              </div>
            </div>
            <div className="p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No alerts yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Send alerts from critical bins
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-300">
                            {alert.dustbinId}
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {alert.location}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "classifier" ? (
          /* AI Waste Classifier Tab */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
            <WasteClassifier />
          </div>
        ) : (
          /* Bus Route Optimizer Tab */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-gray-800/50 transition-shadow">
            <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Municipal Bus Route Optimizer
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Optimized waste collection route for critical &amp; warning bins
              </p>
            </div>
            <div className="p-6">
              <BusRouteOptimizer dustbins={dustbins} />
            </div>
          </div>
        )}
      </div>

      {/* Send Alert Modal */}
      {showAlertModal && selectedBin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Alert
              </h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <p className="font-medium text-red-900 dark:text-red-300">
                  Critical Alert (Mock)
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {selectedBin.id} at {selectedBin.location} -{" "}
                  {selectedBin.fillLevel}%
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                  Note: In production, this would send email/SMS to municipal
                  authorities.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendAlert(selectedBin)}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Send Mock Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Dustbin Modal */}
      {showAddModal && (
        <AddDustbinModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            // Show success message instead of loading from Firebase
            alert(
              "Mock dustbin added successfully! In production, this would save to Firebase.",
            );
            loadAlerts(); // Refresh mock data
          }}
        />
      )}
    </div>
  );
}
