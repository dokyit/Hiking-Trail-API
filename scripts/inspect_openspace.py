import shapefile

def inspect_openspace():
    sf = shapefile.Reader(r"c:\Users\tobyj\HikingTrail\openspace\OPENSPACE_POLY.shp")
    fields = [field[0] for field in sf.fields[1:]]
    print(f"Fields: {fields}")
    if 'SITE_NAME' in fields:
        print(f"First SITE_NAME: {sf.record(0)['SITE_NAME']}")
    else:
        print("SITE_NAME field not found!")

if __name__ == "__main__":
    inspect_openspace()
