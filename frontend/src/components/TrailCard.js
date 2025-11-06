import React, { useState, useEffect } from "react";
import TrailModal from "./TrailModal";

const TrailCard = ({ trail }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if trail is favorited on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(trail.id));
  }, [trail.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation(); // Prevent card click
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((id) => id !== trail.id);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Add to favorites
      favorites.push(trail.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  // Determine difficulty color and styling
  const getDifficultyStyle = (difficulty) => {
    const styles = {
      1: { color: "#28a745", label: "Easy", bgColor: "#d4edda" },
      2: { color: "#ffc107", label: "Moderate", bgColor: "#fff3cd" },
      3: { color: "#fd7e14", label: "Hard", bgColor: "#ffe5d4" },
      4: { color: "#dc3545", label: "Extremely Hard", bgColor: "#f8d7da" },
    };
    return styles[difficulty] || styles[1];
  };

  const difficultyStyle = getDifficultyStyle(trail.difficulty);

  return (
    <>
      <div
        style={{
          border: "2px solid #e0e0e0",
          borderRadius: "12px",
          margin: "12px 0",
          padding: "16px",
          cursor: "pointer",
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          position: "relative",
        }}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = difficultyStyle.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "#e0e0e0";
        }}
      >
        {/* Favorite Star Button */}
        <button
          onClick={toggleFavorite}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            padding: "4px",
            lineHeight: "1",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "⭐" : "☆"}
        </button>

        <h3
          style={{
            margin: "0 0 10px 0",
            color: "#2c5f2d",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          {trail.name}
        </h3>

        <p
          style={{
            margin: "6px 0",
            color: "#555",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "6px" }}>📍</span>
          {trail.location}
        </p>

        <div
          style={{
            margin: "10px 0",
            padding: "6px 12px",
            backgroundColor: difficultyStyle.bgColor,
            borderRadius: "6px",
            display: "inline-block",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: "14px",
              color: difficultyStyle.color,
            }}
          >
            Difficulty: {trail.difficulty_text || difficultyStyle.label}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "12px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          {trail.length_miles && (
            <p
              style={{ margin: "4px 0", display: "flex", alignItems: "center" }}
            >
              <span style={{ marginRight: "4px" }}>🥾</span>
              <strong>{trail.length_miles} mi</strong>
            </p>
          )}
          {trail.elevation_gain_ft && (
            <p
              style={{ margin: "4px 0", display: "flex", alignItems: "center" }}
            >
              <span style={{ marginRight: "4px" }}>⛰️</span>
              <strong>{trail.elevation_gain_ft} ft</strong>
            </p>
          )}
        </div>

        <p
          style={{
            margin: "10px 0 0 0",
            fontSize: "12px",
            color: "#888",
            fontStyle: "italic",
          }}
        >
          Click to view details
        </p>
      </div>

      <TrailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trailId={trail.id}
      />
    </>
  );
};

export default TrailCard;
