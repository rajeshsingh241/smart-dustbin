'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, MapPin, Bell, Send, X, Check, Clock, TrendingUp } from 'lucide-react';
import { listenToDustbinUpdates, createAlert, getAlerts } from '@/lib/firebase';
import type { Dustbin, Alert } from '@/types/dustbin';

export default function DashboardContent() {
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sampleDustbins: Dustbin[] = [
      {
        id: 'BIN001',
        location: 'MP Nagar Zone 1',
        address: 'Near DB Mall, Main Road',
        fillLevel: 85,
        latitude: 23.2599,
        longitude: 77.4126,
        status: 'critical',
        lastUpdated: new Date().toISOString(),
        zone: 'Zone-A'
      },
      {
        id: 'BIN002',
        location: 'New Market Area',
        address: 'Hamidia Road',
        fillLevel: 65,
        latitude: 23.2637,
        longitude: 77.4085,
        status: 'warning',
        lastUpdated: new Date().toISOString(),
        zone: 'Zone-B'
      },
      {
        id: 'BIN003',
        location: 'Railway Station',
        address: 'Platform 1 Exit',
        fillLevel: 92,
        latitude: 23.2646,
        longitude: 77.4125,
        status: 'critical',
        lastUpdated: new Date().toISOString(),
        zone: 'Zone-A'
      },
      {
        id: 'BIN004',
        location: 'Boat Club',
        address: 'Upper Lake Road',
        fillLevel: 35,
        latitude: 23.2494,
        longitude: 77.4094,
        status: 'normal',
        lastUpdated: new Date().toISOString(),
        zone: 'Zone-C'
      }
    ];

    setDustbins(sampleDustbins);
    setLoading(false);

    const unsubscribe = listenToDustbinUpdates((data) => {
      if (data) {
        const bins = Object.entries(data).map(([id, binData]: [string, any]) => ({
          id,
          location: binData.location || 'Unknown',
          address: binData.address || '',
          fillLevel: binData.fillLevel || 0,
          latitude: binData.latitude || 0,
          longitude: binData.longitude || 0,
          status: binData.status || 'normal',
          lastUpdated: binData.lastUpdated || new Date().toISOString(),
          zone: binData.zone || 'Unknown'
        }));
        setDustbins(bins);
      }
    });

    loadAlerts();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDustbins(prev => prev.map(bin => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newLevel = Math.max(0, Math.min(100, bin.fillLevel + change));
        const newStatus = newLevel >= 80 ? 'critical' : newLevel >= 50 ? 'warning' : 'normal';
        
        return {
          ...bin,
          fillLevel: newLevel,
          status: newStatus,
          lastUpdated: new Date().toISOString()
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const alertsData = await getAlerts();
      setAlerts(alertsData as Alert[]);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const sendAlert = async (bin: Dustbin) => {
    try {
      const response = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dustbinId: bin.id,
          location: bin.location,
          fillLevel: bin.fillLevel,
          latitude: bin.latitude,
          longitude: bin.longitude
        })
      });

      if (response.ok) {
        await createAlert({
          dustbinId: bin.id,
          location: bin.location,
          message: `Critical alert for ${bin.id}`,
          sentTo: ['municipal@bhopal.gov.in']
        });

        await loadAlerts();
        setShowAlertModal(false);
        setSelectedBin(null);
      }
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  const criticalBins = dustbins.filter(b => b.status === 'critical').length;
  const avgFillLevel = dustbins.length > 0 
    ? Math.round(dustbins.reduce((acc, b) => acc + b.fillLevel, 0) / dustbins.length)
    : 0;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      default: return <Check className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'dashboard'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            Alerts ({alerts.length})
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bins</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{dustbins.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Trash2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Bins</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{criticalBins}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Fill Level</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{avgFillLevel}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Live Dustbin Status</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fill Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dustbins.map((bin) => (
                      <tr key={bin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Trash2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium">{bin.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{bin.location}</div>
                          <div className="text-xs text-gray-500">{bin.address}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{bin.zone}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  bin.fillLevel >= 80 ? 'bg-red-500' :
                                  bin.fillLevel >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${bin.fillLevel}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{bin.fillLevel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bin.status)}`}>
                            {getStatusIcon(bin.status)}
                            {bin.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(bin.lastUpdated).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(`https://www.google.com/maps?q=${bin.latitude},${bin.longitude}`, '_blank')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                            {bin.status === 'critical' && (
                              <button
                                onClick={() => {
                                  setSelectedBin(bin);
                                  setShowAlertModal(true);
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
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
        ) : (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Alert History</h2>
            </div>
            <div className="p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No alerts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium">{alert.dustbinId}</p>
                          <p className="text-sm text-gray-600">{alert.location}</p>
                          <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sent</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAlertModal && selectedBin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Send Alert</h3>
              <button onClick={() => setShowAlertModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-medium text-red-900">Critical Alert</p>
                <p className="text-sm text-red-700 mt-1">
                  {selectedBin.id} at {selectedBin.location} - {selectedBin.fillLevel}%
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendAlert(selectedBin)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}