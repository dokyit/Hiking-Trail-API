import shapefile

def inspect_attributes():
    sf = shapefile.Reader("data_temp/TRAILS_ARC.shp")
    fields = [field[0] for field in sf.fields[1:]]
    print(f"Fields: {fields}")
    
    count = 0
    examples = []
    for record in sf.records():
        r = dict(zip(fields, record))
        name = r.get('TRAIL_NAME', '').strip()
        if name:
            count += 1
            if len(examples) < 10:
                examples.append(name)
    
    print(f"Total Records: {len(sf.records())}")
    print(f"Records with Names: {count}")
    print(f"Examples: {examples}")

if __name__ == "__main__":
    inspect_attributes()
