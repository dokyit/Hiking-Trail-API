# 🗺️ Trail Highlighting Feature

Complete guide to the trail path highlighting feature on Google Maps.

---

## 🎯 What It Does

When you click on a trail card, the **entire trail path** is highlighted on the Google Maps view, showing the complete hiking route instead of just a single pin marker.

---

## ✨ Features

### 1. **Full Trail Path Visualization**
- Displays the complete trail route as a colored line
- Trail path follows the actual hiking trail
- Color-coded by difficulty level

### 2. **Auto-Zoom to Trail**
- Map automatically zooms to fit the entire trail
- Shows start and end points clearly
- Maintains proper padding for visibility

### 3. **Difficulty Color Coding**
- 🟢 **Green** - Easy trails
- 🟡 **Yellow** - Moderate trails
- 🟠 **Orange** - Hard trails
- 🔴 **Red** - Extremely Hard trails

### 4. **Enhanced Marker**
- Selected trail's start marker enlarges
- Stronger shadow for emphasis
- Higher z-index (appears on top)

### 5. **Keep Trail Info Modal**
- Trail details modal still appears
- Modal shows full trail information
- Gear recommendations included

---

## 🎮 How to Use

### Step 1: Search for Trails
```
Enter a city (e.g., "Boston")
Click "Search"
```

### Step 2: Select a Trail
```
Click any trail card in the left sidebar
```

### Step 3: View Trail on Map
```
✅ Trail path highlights in color on map
✅ Map zooms to show entire trail
✅ Modal opens with trail details
```

### Step 4: Close Modal
```
Click X or outside modal
Trail highlighting disappears
Map returns to showing all trails
```

---

## 🎨 Visual Behavior

### When Trail is Selected:

**Before Click:**
```
Map shows: All trail start markers (small dots)
```

**After Click:**
```
Map shows:
- Selected trail path (colored line following route)
- Selected trail marker (larger, more prominent)
- Other trail markers (normal size, slightly dimmed)
- Trail info modal (overlay with details)
```

**After Closing Modal:**
```
Map shows: All trail markers (back to normal)
Trail path removed
```

---

## 🏔️ Trail Path Details

### Path Rendering:
- **Type:** Google Maps Polyline
- **Line Width:** 5 pixels
- **Opacity:** 90%
- **Geodesic:** Yes (follows Earth's curvature)
- **Smooth:** Anti-aliased edges

### Colors by Difficulty:

| Difficulty | Color | Hex Code |
|------------|-------|----------|
| Easy (1) | Green | `#28a745` |
| Moderate (2) | Yellow | `#ffc107` |
| Hard (3) | Orange | `#fd7e14` |
| Extremely Hard (4) | Red | `#dc3545` |

---

## 💻 Technical Implementation

### Data Flow:

```
1. User clicks TrailCard
   ↓
2. TrailCard calls onTrailSelect(trail)
   ↓
3. Dashboard updates selectedTrail state
   ↓
4. MapComponent receives selectedTrail prop
   ↓
5. TrailPolyline component draws path
   ↓
6. Map auto-zooms to trail bounds
```

### Trail Geometry Format:

Trails are stored in **GeoJSON LineString** format:

```json
{
  "type": "LineString",
  "coordinates": [
    [-71.0833, 42.2000],  // [lng, lat]
    [-71.0850, 42.2050],
    [-71.0900, 42.2100],
    // ... more coordinates
  ]
}
```

### Coordinate Conversion:

```javascript
// Backend stores: [longitude, latitude]
const coords = geometry.coordinates;

// Convert to Google Maps format: {lat, lng}
const path = coords.map(coord => ({
  lat: coord[1],  // latitude
  lng: coord[0]   // longitude
}));
```

---

## 🔧 Components Modified

### 1. Dashboard.js
**Changes:**
- Added `selectedTrail` state
- Pass `selectedTrail` to MapComponent
- Pass `onTrailSelect` callback to TrailCard

```javascript
const [selectedTrail, setSelectedTrail] = useState(null);

<TrailCard 
  trail={trail} 
  onTrailSelect={setSelectedTrail}
/>

<MapComponent 
  selectedTrail={selectedTrail}
/>
```

### 2. TrailCard.js
**Changes:**
- Accepts `onTrailSelect` prop
- Calls `onTrailSelect(trail)` when card clicked
- Calls `onTrailSelect(null)` when modal closed

```javascript
onClick={() => {
  setIsModalOpen(true);
  if (onTrailSelect) {
    onTrailSelect(trail);
  }
}}

onClose={() => {
  setIsModalOpen(false);
  if (onTrailSelect) {
    onTrailSelect(null);
  }
}}
```

### 3. MapComponent.js
**Changes:**
- Added `TrailPolyline` component
- Accepts `selectedTrail` prop
- Renders polyline for selected trail
- Enlarges selected trail marker
- Auto-zooms to trail bounds

```javascript
const TrailPolyline = ({ trail }) => {
  // Parse geometry
  // Convert coordinates
  // Create Google Maps Polyline
  // Fit map bounds to trail
};
```

---

## 🎯 Example Use Cases

### 1. Planning a Hike
```
Search: "Boston"
Filter: Easy trails only
Click: "Walden Pond Loop Trail"
Result: See exact 1.7-mile loop path highlighted
```

### 2. Comparing Trail Routes
```
Click: "Blue Hills Skyline Trail"
View: See the 5.2-mile route
Close modal
Click: "Middlesex Fells Skyline Trail"
View: Compare the 6.8-mile route
```

### 3. Understanding Trail Difficulty
```
Click: "Mount Greylock Summit Trail"
Result: 
- Red path shows 11.5-mile route
- Visual confirmation of "Extremely Hard"
- See elevation changes along route
```

---

## 🔍 Trail Path Features

### Auto-Zoom Behavior:
- Calculates trail bounds (min/max lat/lng)
- Adds 50px padding around trail
- Smooth zoom transition
- Centers map on trail

### Persistence:
- Trail highlights until modal closed
- Clearing selection removes polyline
- New search clears previous selection
- Filtering doesn't affect selection

### Performance:
- Polyline drawn on-demand (not all at once)
- Previous polyline removed before drawing new one
- Efficient coordinate conversion
- Minimal re-renders with React hooks

---

## 🎨 Styling Details

### Selected Trail Marker:
```css
/* Normal marker */
width: 24px;
height: 24px;
border: 3px solid white;
box-shadow: 0 2px 4px rgba(0,0,0,0.3);

/* Selected marker */
width: 32px;           /* +8px larger */
height: 32px;          /* +8px larger */
border: 4px solid white;  /* Thicker border */
box-shadow: 0 4px 12px rgba(0,0,0,0.5);  /* Stronger shadow */
z-index: 1000;         /* On top of others */
```

### Trail Polyline:
```javascript
{
  strokeColor: difficulty_color,
  strokeOpacity: 0.9,
  strokeWeight: 5,
  geodesic: true
}
```

---

## 🐛 Troubleshooting

### Issue: Trail path doesn't appear
**Cause:** Trail geometry not properly formatted
**Fix:** Check backend returns valid GeoJSON LineString

### Issue: Map doesn't zoom to trail
**Cause:** Bounds calculation error
**Fix:** Verify all coordinates are valid lat/lng

### Issue: Multiple trails highlighted
**Cause:** Previous polyline not cleared
**Fix:** Polyline component cleanup function removes old paths

### Issue: Trail path wrong color
**Cause:** Difficulty mapping incorrect
**Fix:** Check difficulty value (1-4) maps to correct color

---

## 📊 Supported Trail Types

Currently supports:
- ✅ **LineString** - Single continuous path
- ✅ **Loop trails** - Path returns to start
- ✅ **Out-and-back** - Path retraces route
- ✅ **Point-to-point** - Different start/end

Future support:
- ⏳ **MultiLineString** - Multiple disconnected segments
- ⏳ **Polygon** - Area-based trails

---

## 🚀 Future Enhancements

Potential improvements:

- [ ] Elevation profile overlay
- [ ] Animated hiking progress along path
- [ ] Waypoint markers along trail
- [ ] Trail segment difficulty coloring
- [ ] Distance markers every mile
- [ ] Photo markers at scenic viewpoints
- [ ] Trail condition overlays
- [ ] Download trail as GPX file
- [ ] 3D terrain view
- [ ] Street View integration at trailheads

---

## 📚 Related Documentation

- **MapComponent.js** - Map rendering logic
- **TrailCard.js** - Trail selection handling
- **Dashboard.js** - State management
- **Backend trail_routes.py** - GeoJSON data source

---

## ✅ Testing Checklist

**Basic Functionality:**
- [ ] Click trail card - path highlights
- [ ] Close modal - path disappears
- [ ] Click different trail - new path shows
- [ ] All difficulties show correct colors
- [ ] Map zooms to fit trail

**Edge Cases:**
- [ ] Very short trails (< 1 mile)
- [ ] Very long trails (> 10 miles)
- [ ] Loop trails (start = end)
- [ ] Trails crossing water
- [ ] Trails at map boundaries

**Performance:**
- [ ] Fast rendering (< 500ms)
- [ ] No memory leaks
- [ ] Smooth zoom transitions
- [ ] Multiple selections don't lag

---

## 🎉 Summary

**What You Get:**
- ✅ Full trail path visualization
- ✅ Color-coded by difficulty
- ✅ Auto-zoom to trail
- ✅ Enhanced selected marker
- ✅ Keeps trail info modal
- ✅ Smooth animations
- ✅ Clean cleanup on deselect

**User Benefits:**
- See complete hiking route
- Understand trail layout before hiking
- Compare different trail paths
- Visual confirmation of difficulty
- Better trip planning

**Technical Benefits:**
- Efficient React hooks
- Proper cleanup (no memory leaks)
- Reusable components
- Type-safe props
- Well-documented code

---

**Try it now! Search for "Boston" and click any trail card to see the magic! 🗺️🥾**