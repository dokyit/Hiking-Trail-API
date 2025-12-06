import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import MapComponent from "../components/MapComponent";
import TrailCard from "../components/TrailCard";
import Weather from "../components/Weather";
import { getFavorites } from '../services/favoritesService';

const Dashboard = () => {
  const [city, setCity] = useState("Boston"); // Default city
  const [searchTerm, setSearchTerm] = useState("Boston");
  const [trails, setTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 42.3601, lng: -71.0589 }); // Default to Boston
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favoriteTrails, setFavoriteTrails] = useState([]);
  const [favoriteTrailIds, setFavoriteTrailIds] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Filter and sort states
  const [selectedDifficulties, setSelectedDifficulties] = useState([
    1, 2, 3, 4,
  ]); // All selected by default
  const [sortBy, setSortBy] = useState("name"); // name, difficulty, distance

  // Selected trail for map highlighting
  const [selectedTrail, setSelectedTrail] = useState(null);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setCity(searchTerm);

    try {
      const res = await axios.get(
        `${API_URL}/api/trails/search?city=${searchTerm}`,
      );
      setTrails(res.data.trails);
      setFilteredTrails(res.data.trails); // Initialize filtered trails
      setMapCenter(res.data.map_center); // Map animates to new center
      setLoading(false);
    } catch (error) {
      console.error("Error searching trails:", error);
      setError(
        "Could not find trails for that city. Please try another Massachusetts city.",
      );
      setLoading(false);
    }
  };

  // Load favorite trails from server
  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const favorites = await getFavorites();
      setFavoriteTrails(favorites);
      setFavoriteTrailIds(favorites.map(trail => trail.id));
    } catch (error) {
      console.error("Error loading favorites:", error);
      // If not authenticated, just set empty arrays
      setFavoriteTrails([]);
      setFavoriteTrailIds([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Open favorites modal
  const openFavorites = () => {
    setShowFavoritesModal(true);
    loadFavorites();
  };

  // Filter and sort trails whenever filters change
  useEffect(() => {
    let result = [...trails];

    // Filter by difficulty
    result = result.filter((trail) =>
      selectedDifficulties.includes(trail.difficulty),
    );

    // Sort trails
    switch (sortBy) {
      case "difficulty":
        result.sort((a, b) => a.difficulty - b.difficulty);
        break;
      case "distance":
        result.sort((a, b) => a.length_miles - b.length_miles);
        break;
      case "elevation":
        result.sort((a, b) => a.elevation_gain_ft - b.elevation_gain_ft);
        break;
      case "name":
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredTrails(result);
  }, [trails, selectedDifficulties, sortBy]);

  // Load favorites on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadFavorites();
    }
  }, []);

  // Toggle difficulty filter
  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties((prev) => {
      if (prev.includes(difficulty)) {
        return prev.filter((d) => d !== difficulty);
      } else {
        return [...prev, difficulty].sort();
      }
    });
  };

  // Get difficulty info
  const getDifficultyInfo = (level) => {
    const info = {
      1: { label: "Easy", color: "#28a745", emoji: "🟢" },
      2: { label: "Moderate", color: "#ffc107", emoji: "🟡" },
      3: { label: "Hard", color: "#fd7e14", emoji: "🟠" },
      4: { label: "Extremely Hard", color: "#dc3545", emoji: "🔴" },
    };
    return info[level] || info[1];
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "20px 30px",
          backgroundColor: "#2c5f2d",
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "600" }}>
              🥾 Massachusetts Trail Finder
            </h1>
            <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
              Discover amazing hiking trails across Massachusetts
            </p>
          </div>
          <button
            onClick={openFavorites}
            style={{
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#2c5f2d",
              border: "2px solid #fff",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            ⭐ Favorites
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 96px)", flex: 1 }}>
        {/* Left Panel: Search and Trail List */}
        <div
          style={{
            width: "30%",
            minWidth: "350px",
            padding: "20px",
            overflowY: "auto",
            borderRight: "2px solid #e0e0e0",
            backgroundColor: "#fafafa",
          }}
        >
          <Weather city={city} />

          <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Enter a Massachusetts City or Town
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., Boston, Cambridge, Worcester"
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "15px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2c5f2d")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: loading ? "#999" : "#2c5f2d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor = "#1e4620";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading)
                      e.currentTarget.style.backgroundColor = "#2c5f2d";
                  }}
                >
                  {loading ? "..." : "Search"}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div
              style={{
                padding: "15px",
                marginBottom: "20px",
                backgroundColor: "#f8d7da",
                border: "1px solid #dc3545",
                borderRadius: "8px",
                color: "#721c24",
              }}
            >
              <p style={{ margin: 0 }}>❌ {error}</p>
            </div>
          )}

          {/* Filter and Sort Controls */}
          {trails.length > 0 && (
            <div
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "16px",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                🔍 Filter & Sort
              </h3>

              {/* Difficulty Filter */}
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#555",
                  }}
                >
                  Difficulty:
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[1, 2, 3, 4].map((level) => {
                    const info = getDifficultyInfo(level);
                    const isSelected = selectedDifficulties.includes(level);
                    return (
                      <button
                        key={level}
                        onClick={() => toggleDifficulty(level)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: isSelected ? info.color : "#f0f0f0",
                          color: isSelected ? "#fff" : "#666",
                          border: isSelected
                            ? `2px solid ${info.color}`
                            : "2px solid #ddd",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: isSelected ? "600" : "500",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#e0e0e0";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "#f0f0f0";
                          }
                        }}
                      >
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#555",
                  }}
                >
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "14px",
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    outline: "none",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2c5f2d")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="difficulty">Difficulty (Easy to Hard)</option>
                  <option value="distance">Distance (Shortest First)</option>
                  <option value="elevation">Elevation (Lowest First)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#666" }}>Searching for trails...</p>
              </div>
            ) : filteredTrails.length === 0 && trails.length > 0 ? (
              <div
                style={{
                  padding: "30px 20px",
                  textAlign: "center",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "2px dashed #ddd",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "48px",
                  }}
                >
                  🔍
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "15px",
                    lineHeight: "1.5",
                  }}
                >
                  No trails match your filters. Try selecting more difficulty
                  levels!
                </p>
              </div>
            ) : trails.length === 0 ? (
              <div
                style={{
                  padding: "30px 20px",
                  textAlign: "center",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "2px dashed #ddd",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "48px",
                  }}
                >
                  🗺️
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                    fontSize: "15px",
                    lineHeight: "1.5",
                  }}
                >
                  Enter a city name above to discover nearby hiking trails!
                </p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "18px",
                    color: "#333",
                    fontWeight: "600",
                  }}
                >
                  Showing {filteredTrails.length} of {trails.length} trail
                  {trails.length !== 1 ? "s" : ""} near {city}
                </h2>
                {filteredTrails.map((trail) => (
                  <TrailCard
                    key={trail.id}
                    trail={trail}
                    onTrailSelect={setSelectedTrail}
                    favoriteTrailIds={favoriteTrailIds}
                    onFavoriteChange={loadFavorites}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div style={{ width: "70%", height: "100%", position: "relative" }}>
          <MapComponent
            center={mapCenter}
            trails={filteredTrails}
            selectedTrail={selectedTrail}
          />
        </div>
      </div>

      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowFavoritesModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, color: "#2c5f2d", fontSize: "24px" }}>
                ⭐ Your Favorite Trails
              </h2>
              <button
                onClick={() => setShowFavoritesModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666",
                  lineHeight: "1",
                  padding: "0",
                }}
              >
                ×
              </button>
            </div>

            {loadingFavorites ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#666" }}>Loading favorites...</p>
              </div>
            ) : favoriteTrails.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>☆</p>
                <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
                  No favorite trails yet. Click the star on any trail card to
                  add it to your favorites!
                </p>
              </div>
            ) : (
              <div>
                {favoriteTrails.map((trail) => (
                  <TrailCard
                    key={trail.id}
                    trail={trail}
                    favoriteTrailIds={favoriteTrailIds}
                    onFavoriteChange={loadFavorites}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
