export interface Dustbin {
  id: string;
  location: string;
  address: string;
  fillLevel: number;
  latitude: number;
  longitude: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
  zone: string;
}

export interface Alert {
  id: string;
  dustbinId: string;
  location: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'pending';
  sentTo: string[];
}