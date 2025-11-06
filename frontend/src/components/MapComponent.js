import React, { useEffect, useRef } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

// Component to handle map animation when center changes
const MapAnimator = ({ center }) => {
  const map = useMap();
  const prevCenterRef = useRef(null);

  useEffect(() => {
    if (map && center) {
      const prevCenter = prevCenterRef.current;
      
      // Only animate if center has actually changed
      if (!prevCenter || prevCenter.lat !== center.lat || prevCenter.lng !== center.lng) {
        // Smooth pan and zoom animation
        map.panTo(center);
        map.setZoom(11);
        
        prevCenterRef.current = center;
      }
    }
  }, [map, center]);

  return null;
};

const MapComponent = ({ center, trails }) => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Map
        mapId="mass-trail-map"
        defaultCenter={center}
        center={center}
        defaultZoom={10}
        zoom={11}
        gestureHandling={"greedy"}
        mapTypeId="terrain"
        options={{
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <MapAnimator center={center} />
        
        {trails.map((trail) => {
          // Parse the GeoJSON geometry
          const geometry = JSON.parse(trail.geometry);
          const coords = geometry.coordinates;
          
          // Get the first coordinate (start of trail)
          const startLat = coords[0][1];
          const startLng = coords[0][0];
          
          // Determine marker color based on difficulty
          let markerColor = "#28a745"; // Easy - Green
          if (trail.difficulty === 2) markerColor = "#ffc107"; // Moderate - Yellow
          if (trail.difficulty === 3) markerColor = "#fd7e14"; // Hard - Orange
          if (trail.difficulty === 4) markerColor = "#dc3545"; // Extremely Hard - Red

          return (
            <AdvancedMarker
              key={trail.id}
              position={{
                lat: startLat,
                lng: startLng,
              }}
              title={trail.name}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: markerColor,
                  border: "3px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                }}
              />
            </AdvancedMarker>
          );
        })}
      </Map>
    </div>
  );
};

export default MapComponent;
