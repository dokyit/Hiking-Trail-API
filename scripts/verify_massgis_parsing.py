import os
import shapefile
import json
import math
from pyproj import Transformer
from shapely.geometry import LineString, shape, Polygon
from shapely.strtree import STRtree
from shapely.ops import linemerge

try:
    from scripts.ma_towns import MA_TOWNS
except ImportError:
    from ma_towns import MA_TOWNS

# Local paths
TRAILS_SHP = r"c:\Users\tobyj\HikingTrail\MAD_Trails\MAD_TRAILS.shp"
OPENSPACE_SHP = r"c:\Users\tobyj\HikingTrail\openspace\OPENSPACE_POLY.shp"

def get_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in miles between two points."""
    R = 3959 # Radius of Earth in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def get_nearest_town(lat, lon):
    """Find the nearest town to a point."""
    nearest = None
    min_dist = float('inf')
    
    for town in MA_TOWNS:
        dist = get_distance(lat, lon, town['lat'], town['lon'])
        if dist < min_dist:
            min_dist = dist
            nearest = town
            
    return nearest, min_dist

def verify_parsing():
    print("Loading OpenSpace data...")
    sf_os = shapefile.Reader(OPENSPACE_SHP)
    os_fields = [field[0] for field in sf_os.fields[1:]]
    os_records = sf_os.records()
    os_shapes = sf_os.shapes()
    
    # Build STRtree for OpenSpace
    os_geoms = []
    valid_os_indices = []
    for i, s in enumerate(os_shapes):
        if s.points:
            try:
                geom = shape(s.__geo_interface__)
                os_geoms.append(geom)
                valid_os_indices.append(i)
            except Exception:
                continue
                
    print(f"Building spatial index for {len(os_geoms)} OpenSpace polygons...")
    tree = STRtree(os_geoms)
    
    print(f"Reading Trails shapefile: {TRAILS_SHP}")
    sf = shapefile.Reader(TRAILS_SHP)
    print(f"Number of records: {len(sf.records())}")
    
    transformer = Transformer.from_crs("EPSG:26986", "EPSG:4326", always_xy=True)
    
    fields = [field[0] for field in sf.fields[1:]]
    records = sf.records()
    shapes = sf.shapes()
    print(f"Processing all {len(records)} trails...")
    
    # First pass: Process all features and assign names
    processed_features = []
    
    for i, record in enumerate(records):
        if i % 10000 == 0:
            print(f"  Processed {i} trails...")
            
        s = shapes[i]
        if not s.points:
            continue
            
        # Create LineString from original points (EPSG:26986 - meters)
        original_line = LineString(s.points)
        length_meters = original_line.length
        length_miles = length_meters * 0.000621371
        
        # Transform points to WGS84 for display
        transformed_points = [transformer.transform(x, y) for x, y in s.points]
        
        # Get centroid for town lookup (approximate using first point)
        start_lon, start_lat = transformed_points[0]
        nearest_town, dist_to_town = get_nearest_town(start_lat, start_lon)
        
        # Find intersecting OpenSpace
        site_name = None
        query_indices = tree.query(original_line)
        
        for idx in query_indices:
            os_poly = os_geoms[idx]
            if original_line.intersects(os_poly):
                original_idx = valid_os_indices[idx]
                r = os_records[original_idx]
                r_dict = dict(zip(os_fields, r))
                if 'SITE_NAME' in r_dict and r_dict['SITE_NAME'].strip():
                    site_name = r_dict['SITE_NAME'].strip()
                    break
        
        # Determine Name
        name = "Unknown Trail"
        
        if site_name:
            name = f"Trail in {site_name}"
        elif nearest_town:
            suffixes = ["Trail", "Path", "Loop", "Hike", "Walk"]
            suffix = suffixes[i % len(suffixes)]
            name = f"{nearest_town['name']} {suffix}"
             
        processed_features.append({
            "name": name,
            "geometry": original_line,
            "length_miles": length_miles,
            "town": nearest_town['name'] if nearest_town else "Unknown",
            "original_props": dict(zip(fields, record))
        })

    print(f"Processed {len(processed_features)} trails. Aggregating by name...")
    
    # Second pass: Aggregate by name
    aggregated_trails = {}
    
    for pf in processed_features:
        name = pf['name']
        if name not in aggregated_trails:
            aggregated_trails[name] = {
                "name": name,
                "geometries": [],
                "total_length": 0,
                "town": pf['town'], 
                "original_props": pf['original_props']
            }
        
        aggregated_trails[name]["geometries"].append(pf['geometry'])
        aggregated_trails[name]["total_length"] += pf['length_miles']

    # Create final GeoJSON features
    print("Creating GeoJSON with merged geometries...")
    final_features = []
    
    for name, data in aggregated_trails.items():
        total_length = data["total_length"]
        
        # Merge geometries
        geoms = data["geometries"]
        merged_geom = linemerge(geoms)
        
        # Convert back to coordinates for GeoJSON
        if merged_geom.geom_type == 'LineString':
            coords = [transformer.transform(x, y) for x, y in merged_geom.coords]
            final_geometry = {
                "type": "LineString",
                "coordinates": coords
            }
        elif merged_geom.geom_type == 'MultiLineString':
            final_coords = []
            for line in merged_geom.geoms:
                coords = [transformer.transform(x, y) for x, y in line.coords]
                final_coords.append(coords)
            final_geometry = {
                "type": "MultiLineString",
                "coordinates": final_coords
            }
        else:
            # Handle other geometry types
            continue
        
        # Calculate difficulty based on TOTAL length
        difficulty = 1
        if total_length < 3:
            difficulty = 1
        elif total_length < 6:
            difficulty = 2
        elif total_length < 10:
            difficulty = 3
        else:
            difficulty = 4
            
        props = data["original_props"]
        props['name'] = name
        props['length_miles'] = round(total_length, 2)
        props['difficulty'] = difficulty
        props['town'] = data['town']
        props['estimated_time_min'] = int((total_length / 2.0) * 60)
        
        feature = {
            "type": "Feature",
            "properties": props,
            "geometry": final_geometry
        }
        final_features.append(feature)

    print(f"Aggregated into {len(final_features)} unique trails.")
    
    geojson = {
        "type": "FeatureCollection",
        "features": final_features
    }
    
    with open("trails.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson, f)
        
    print("Exported trails.geojson")

if __name__ == "__main__":
    verify_parsing()
