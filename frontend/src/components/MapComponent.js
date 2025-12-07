import React, { useEffect, useRef } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";

// ... [Keep all your helper functions like parseTrailGeometry, etc.] ...
// ... [No changes needed to helper functions] ...

// [Paste the helper functions here if you are replacing the whole file,
//  otherwise just scroll down to MapComponent at the bottom]

const parseTrailGeometry = (rawGeometry) => {
  if (!rawGeometry) return null;
  try {
    return typeof rawGeometry === "string"
      ? JSON.parse(rawGeometry)
      : rawGeometry;
  } catch (error) {
    return null;
  }
};

const extractCoordinateArray = (geometry) => {
  if (!geometry) return null;
  if (Array.isArray(geometry.coordinates)) return geometry.coordinates;
  if (geometry.geometry) return extractCoordinateArray(geometry.geometry);
  if (geometry.features) {
    for (const feature of geometry.features) {
      const coords = extractCoordinateArray(feature);
      if (coords) return coords;
    }
  }
  return null;
};

const findFirstCoordinate = (coordinates) => {
  if (!coordinates) return null;
  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === "number"
  ) {
    return coordinates;
  }
  if (Array.isArray(coordinates)) {
    for (const nested of coordinates) {
      const found = findFirstCoordinate(nested);
      if (found) return found;
    }
  }
  return null;
};

const flattenCoordinates = (coordinates, accumulator = []) => {
  if (!coordinates) return accumulator;
  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === "number"
  ) {
    accumulator.push(coordinates);
    return accumulator;
  }
  if (Array.isArray(coordinates)) {
    coordinates.forEach((item) => flattenCoordinates(item, accumulator));
    return accumulator;
  }
  if (coordinates && typeof coordinates === "object") {
    if (Array.isArray(coordinates.coordinates))
      flattenCoordinates(coordinates.coordinates, accumulator);
    else if (Array.isArray(coordinates.features))
      coordinates.features.forEach((f) => flattenCoordinates(f, accumulator));
    else if (coordinates.geometry)
      flattenCoordinates(coordinates.geometry, accumulator);
  }
  return accumulator;
};

const TrailPolyline = ({ trail }) => {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !trail) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const geometry = parseTrailGeometry(trail.geometry);
    const coords = extractCoordinateArray(geometry);

    if (!Array.isArray(coords) || coords.length === 0) {
      if (polylineRef.current) polylineRef.current.setMap(null);
      return;
    }

    const rawPoints = flattenCoordinates(coords);
    const path = [];

    rawPoints.forEach(([lng, lat]) => {
      if (typeof lng !== "number" || typeof lat !== "number") return;
      const lastPoint = path[path.length - 1];
      if (!lastPoint || lastPoint.lat !== lat || lastPoint.lng !== lng) {
        path.push({ lat, lng });
      }
    });

    if (path.length === 0) {
      if (polylineRef.current) polylineRef.current.setMap(null);
      return;
    }

    let strokeColor = "#28a745";
    if (trail.difficulty === 2) strokeColor = "#ffc107";
    if (trail.difficulty === 3) strokeColor = "#fd7e14";
    if (trail.difficulty === 4) strokeColor = "#dc3545";

    if (polylineRef.current) polylineRef.current.setMap(null);

    polylineRef.current = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: strokeColor,
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: map,
    });

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, { padding: 50 });

    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
  }, [map, trail]);

  return null;
};

const MapAnimator = ({ center }) => {
  const map = useMap();
  const prevCenterRef = useRef(null);

  useEffect(() => {
    if (map && center) {
      const prevCenter = prevCenterRef.current;
      if (
        !prevCenter ||
        prevCenter.lat !== center.lat ||
        prevCenter.lng !== center.lng
      ) {
        map.panTo(center);
        map.setZoom(11);
        prevCenterRef.current = center;
      }
    }
  }, [map, center]);

  return null;
};

const MapComponent = ({ center, trails, selectedTrail, onMarkerClick }) => {
  const mapId = process.env.REACT_APP_GOOGLE_MAP_ID;

  return (
    // FIX: Changed height from 100vh to 100% to fit parent container
    <div style={{ height: "100%", width: "100%" }}>
      <Map
        defaultCenter={center}
        defaultZoom={10}
        mapId={mapId || undefined}
        gestureHandling={"greedy"}
        mapTypeId="terrain"
        options={{
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <MapAnimator center={center} />
        <TrailPolyline trail={selectedTrail} />

        {trails.map((trail) => {
          if (!trail?.geometry) return null;
          const geometry = parseTrailGeometry(trail.geometry);
          if (!geometry) return null;

          const coords = extractCoordinateArray(geometry);
          const firstCoordinate = findFirstCoordinate(coords);

          if (!firstCoordinate) return null;

          const startLat = firstCoordinate[1];
          const startLng = firstCoordinate[0];
          const isSelected = selectedTrail && selectedTrail.id === trail.id;

          let markerColor = "#28a745";
          if (trail.difficulty === 2) markerColor = "#ffc107";
          if (trail.difficulty === 3) markerColor = "#fd7e14";
          if (trail.difficulty === 4) markerColor = "#dc3545";

          const markerIcon =
            window.google && window.google.maps
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: isSelected ? 10 : 7,
                  fillColor: markerColor,
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: isSelected ? 3 : 2,
                }
              : undefined;

          return (
            <Marker
              key={trail.id}
              position={{ lat: startLat, lng: startLng }}
              title={trail.name}
              icon={markerIcon}
              onClick={() => {
                if (onMarkerClick) onMarkerClick(trail);
              }}
            />
          );
        })}
      </Map>
    </div>
  );
};

export default MapComponent;
