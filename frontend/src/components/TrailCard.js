import React, { useMemo } from "react";
import { MapPin, Clock, Ruler, Mountain, Star, Loader2 } from "lucide-react";

const formatDuration = (minutes) => {
  if (!minutes) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const DIFFICULTY_META = {
  1: { label: "Easy", color: "#28a745", background: "#e8f5e9" }, // Removed emoji
  2: { label: "Moderate", color: "#ffc107", background: "#fff8e1" },
  3: { label: "Hard", color: "#fd7e14", background: "#fff3e0" },
  4: { label: "Expert", color: "#dc3545", background: "#fce8e8" },
};

const baseCardStyle = {
  border: "1px solid #eaeaea",
  borderRadius: "16px",
  margin: "12px 0",
  padding: "20px",
  cursor: "pointer",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  position: "relative",
  overflow: "hidden",
};

const TrailCard = ({
  trail,
  isSelected = false,
  isFavorite = false,
  loadingFavorite = false,
  disableDetails = false,
  onSelect,
  onOpenDetails,
  onToggleFavorite,
  onHover,
}) => {
  const difficulty = useMemo(() => {
    const fallback = DIFFICULTY_META[1];
    if (!trail || typeof trail.difficulty !== "number") {
      return fallback;
    }
    return DIFFICULTY_META[trail.difficulty] ?? fallback;
  }, [trail]);

  const cardStyle = useMemo(() => {
    if (!isSelected) {
      return baseCardStyle;
    }
    return {
      ...baseCardStyle,
      borderColor: difficulty.color,
      boxShadow: `0 12px 24px -10px ${difficulty.color}40`, // Soft colored shadow
      transform: "translateY(-4px)",
    };
  }, [difficulty.color, isSelected]);

  const handleCardClick = () => {
    if (!trail) return;
    if (onSelect) onSelect(trail);
    if (!disableDetails && onOpenDetails) onOpenDetails(trail);
  };

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    if (!trail || !onToggleFavorite || loadingFavorite) return;
    onToggleFavorite(trail, !isFavorite);
  };

  const handleMouseEnter = (event) => {
    if (onHover && trail) onHover(trail, true);
    if (isSelected) return;
    event.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
    event.currentTarget.style.transform = "translateY(-4px)";
  };

  const handleMouseLeave = (event) => {
    if (onHover && trail) onHover(trail, false);
    if (isSelected) return;
    event.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.04)";
    event.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <article
      role="button"
      tabIndex={0}
      style={cardStyle}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Favorite Button */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        disabled={loadingFavorite}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "none",
          border: "none",
          cursor: loadingFavorite ? "not-allowed" : "pointer",
          padding: "4px",
          color: isFavorite ? "#ffc107" : "#cbd5e0",
          transition: "transform 0.2s, color 0.2s",
        }}
      >
        {loadingFavorite ? (
          <Loader2 size={20} className="spin-anim" color="#888" />
        ) : (
          <Star
            size={22}
            fill={isFavorite ? "#ffc107" : "none"}
            strokeWidth={isFavorite ? 0 : 2}
          />
        )}
      </button>

      {/* Header */}
      <h3
        style={{
          margin: "0 24px 8px 0", // Right margin avoids overlapping the star
          color: "#1a202c",
          fontSize: "18px",
          fontWeight: "600",
          lineHeight: "1.4",
        }}
      >
        {trail?.name ?? "Unnamed Trail"}
      </h3>

      {/* Location */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "12px",
        }}
      >
        <MapPin size={14} color="#718096" />
        <span style={{ fontSize: "13px", color: "#718096", fontWeight: "500" }}>
          {trail?.location ?? "Location unavailable"}
        </span>
      </div>

      {/* Difficulty Tag */}
      <div
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "99px",
          backgroundColor: difficulty.background,
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: difficulty.color,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {trail?.difficulty_text ?? difficulty.label}
        </span>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          paddingTop: "16px",
          borderTop: "1px solid #f7fafc",
        }}
      >
        {/* Length */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Ruler size={16} color="#4a5568" />
          <span
            style={{ fontSize: "13px", color: "#4a5568", fontWeight: "500" }}
          >
            {trail?.length_miles ? `${trail.length_miles} mi` : "--"}
          </span>
        </div>

        {/* Elevation */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Mountain size={16} color="#4a5568" />
          <span
            style={{ fontSize: "13px", color: "#4a5568", fontWeight: "500" }}
          >
            {trail?.elevation_gain_ft ? `${trail.elevation_gain_ft} ft` : "--"}
          </span>
        </div>

        {/* Time */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={16} color="#4a5568" />
          <span
            style={{ fontSize: "13px", color: "#4a5568", fontWeight: "500" }}
          >
            {formatDuration(trail?.estimated_time_minutes) || "--"}
          </span>
        </div>
      </div>

      {!disableDetails && (
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <span
            style={{ fontSize: "12px", color: "#2c5f2d", fontWeight: "600" }}
          >
            View Details →
          </span>
        </div>
      )}
    </article>
  );
};

export default TrailCard;
