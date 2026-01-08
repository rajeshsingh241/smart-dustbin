'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import type { Dustbin } from '@/types/dustbin';

interface MapViewProps {
  dustbins: Dustbin[];
}

export default function MapView({ dustbins }: MapViewProps) {
  const center = { lat: 23.2599, lng: 77.4126 }; // Your city center

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={center}
        zoom={12}
      >
        {dustbins.map((bin) => (
          <Marker
            key={bin.id}
            position={{ lat: bin.latitude, lng: bin.longitude }}
            title={`${bin.id} - ${bin.location} (${bin.fillLevel}%)`}
            icon={{
              url: bin.status === 'critical' 
                ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : bin.status === 'warning'
                ? 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}