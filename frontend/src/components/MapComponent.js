import React, { useEffect, useRef } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

// Component to draw trail polyline on the map
const TrailPolyline = ({ trail }) => {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !trail) {
      // Clear polyline if no trail selected
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    // Parse trail geometry
    const geometry = JSON.parse(trail.geometry);
    const coords = geometry.coordinates;

    // Convert to Google Maps LatLng format
    const path = coords.map((coord) => ({
      lat: coord[1],
      lng: coord[0],
    }));

    // Determine color based on difficulty
    let strokeColor = "#28a745"; // Easy - Green
    if (trail.difficulty === 2) strokeColor = "#ffc107"; // Moderate - Yellow
    if (trail.difficulty === 3) strokeColor = "#fd7e14"; // Hard - Orange
    if (trail.difficulty === 4) strokeColor = "#dc3545"; // Extremely Hard - Red

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline
    polylineRef.current = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: strokeColor,
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: map,
    });

    // Fit map to trail bounds
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, { padding: 50 });

    // Cleanup function
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, trail]);

  return null;
};

// Component to handle map animation when center changes
const MapAnimator = ({ center }) => {
  const map = useMap();
  const prevCenterRef = useRef(null);

  useEffect(() => {
    if (map && center) {
      const prevCenter = prevCenterRef.current;

      // Only animate if center has actually changed
      if (
        !prevCenter ||
        prevCenter.lat !== center.lat ||
        prevCenter.lng !== center.lng
      ) {
        // Smooth pan and zoom animation
        map.panTo(center);
        map.setZoom(11);

        prevCenterRef.current = center;
      }
    }
  }, [map, center]);

  return null;
};

const MapComponent = ({ center, trails, selectedTrail }) => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Map
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

        {/* Draw selected trail polyline */}
        <TrailPolyline trail={selectedTrail} />

        {trails.map((trail) => {
          // Parse the GeoJSON geometry
          const geometry = JSON.parse(trail.geometry);
          const coords = geometry.coordinates;

          // Get the first coordinate (start of trail)
          const startLat = coords[0][1];
          const startLng = coords[0][0];

          // Determine if this trail is selected
          const isSelected = selectedTrail && selectedTrail.id === trail.id;

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
                  width: isSelected ? "32px" : "24px",
                  height: isSelected ? "32px" : "24px",
                  borderRadius: "50%",
                  backgroundColor: markerColor,
                  border: isSelected ? "4px solid white" : "3px solid white",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(0,0,0,0.5)"
                    : "0 2px 4px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  zIndex: isSelected ? 1000 : 1,
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
