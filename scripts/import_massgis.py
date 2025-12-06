import os
import sys
import requests
import zipfile
import io
import shapefile
from pyproj import Transformer
from shapely.geometry import LineString, MultiLineString
from geoalchemy2.shape import from_shape

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.trail import Trail

MASSGIS_URL = "https://s3.us-east-1.amazonaws.com/download.massgis.digital.mass.gov/shapefiles/state/trails.zip"
DOWNLOAD_DIR = "data_temp"

def download_and_extract():
    """Download and extract the MassGIS trails shapefile."""
    print(f"Downloading data from {MASSGIS_URL}...")
    response = requests.get(MASSGIS_URL)
    response.raise_for_status()
    
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
        
    print("Extracting zip file...")
    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        z.extractall(DOWNLOAD_DIR)
    
    print("Download and extraction complete.")

def import_data():
    """Read the shapefile and import into the database."""
    app = create_app()
    
    # Find the shapefile
    shapefile_path = None
    for root, dirs, files in os.walk(DOWNLOAD_DIR):
        for file in files:
            if file.endswith(".shp") and "trails" in file.lower():
                shapefile_path = os.path.join(root, file)
                break
    
    if not shapefile_path:
        print("Could not find shapefile in extracted data.")
        return

    print(f"Reading shapefile: {shapefile_path}")
    sf = shapefile.Reader(shapefile_path)
    
    # MassGIS data is usually in EPSG:26986 (NAD83 / Massachusetts Mainland)
    # We need to transform to EPSG:4326 (WGS84)
    # Let's assume input is 26986 based on MassGIS standard, but we should verify if possible.
    # For now, hardcoding 26986 -> 4326 is a safe bet for MassGIS.
    transformer = Transformer.from_crs("EPSG:26986", "EPSG:4326", always_xy=True)
    
    fields = [field[0] for field in sf.fields[1:]]
    print(f"Fields: {fields}")
    
    records = sf.records()
    shapes = sf.shapes()
    
    print(f"Found {len(records)} trails. Importing to database...")
    
    with app.app_context():
        print("Clearing existing trails...")
        Trail.query.delete()
        
        count = 0
        for i, record in enumerate(records):
            shape = shapes[i]
            
            # Get attributes
            # Map fields to dict
            rec_dict = dict(zip(fields, record))
            
            # Determine name
            name = "Unknown Trail"
            # Check common name fields
            for key in ['TRAIL_NAME', 'NAME', 'Label', 'LABEL']:
                if key in rec_dict and rec_dict[key] and isinstance(rec_dict[key], str) and rec_dict[key].strip():
                    name = rec_dict[key].strip()
                    break
            
            if name == "Unknown Trail":
                # Use class
                cls = rec_dict.get('CLASS')
                if cls == 7:
                    name = "Unimproved Road / Track"
                elif cls == 8:
                    name = "Hiking Trail"
            
            # Skip empty shapes
            if not shape.points:
                continue
                
            # Transform coordinates
            # shape.points are (x, y)
            # Transformer expects (x, y)
            transformed_points = [transformer.transform(x, y) for x, y in shape.points]
            
            # Create LineString
            # pyshp parts indicates where new parts start (for multi-geometries)
            parts = shape.parts
            parts.append(len(shape.points))
            
            geoms = []
            for j in range(len(parts) - 1):
                start = parts[j]
                end = parts[j+1]
                segment_points = transformed_points[start:end]
                if len(segment_points) >= 2:
                    geoms.append(LineString(segment_points))
            
            if not geoms:
                continue
                
            for line_geom in geoms:
                # Create Trail object
                trail = Trail(
                    name=name,
                    location="Massachusetts",
                    length_miles=0, # Placeholder
                    elevation_gain_ft=0,
                    description="Imported from MassGIS",
                    difficulty=1,
                    geom=from_shape(line_geom, srid=4326)
                )
                db.session.add(trail)
                count += 1
                
                if count % 100 == 0:
                    print(f"Processed {count} trails...")
        
        db.session.commit()
        print(f"Successfully imported {count} trails.")

if __name__ == "__main__":
    download_and_extract()
    import_data()
