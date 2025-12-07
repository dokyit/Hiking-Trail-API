import React, { useMemo } from "react";

const formatDuration = (minutes) => {
  if (!minutes) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const DIFFICULTY_META = {
  1: { label: "Easy", color: "#28a745", background: "#d4edda", emoji: "🟢" },
  2: {
    label: "Moderate",
    color: "#ffc107",
    background: "#fff3cd",
    emoji: "🟡",
  },
  3: { label: "Hard", color: "#fd7e14", background: "#ffe5d4", emoji: "🟠" },
  4: {
    label: "Extremely Hard",
    color: "#dc3545",
    background: "#f8d7da",
    emoji: "🔴",
  },
};

const baseCardStyle = {
  border: "2px solid #e0e0e0",
  borderRadius: "12px",
  margin: "12px 0",
  padding: "16px",
  cursor: "pointer",
  backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  position: "relative",
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
      boxShadow: "0 8px 18px rgba(44,95,45,0.25)",
      transform: "translateY(-2px)",
    };
  }, [difficulty.color, isSelected]);

  const handleCardClick = () => {
    if (!trail) {
      return;
    }
    if (onSelect) {
      onSelect(trail);
    }
    if (!disableDetails && onOpenDetails) {
      onOpenDetails(trail);
    }
  };

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    if (!trail || !onToggleFavorite || loadingFavorite) {
      return;
    }
    onToggleFavorite(trail, !isFavorite);
  };

  const handleMouseEnter = (event) => {
    if (onHover && trail) {
      onHover(trail, true);
    }
    if (isSelected) {
      return;
    }
    event.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
    event.currentTarget.style.transform = "translateY(-2px)";
    event.currentTarget.style.borderColor = difficulty.color;
  };

  const handleMouseLeave = (event) => {
    if (onHover && trail) {
      onHover(trail, false);
    }
    if (isSelected) {
      return;
    }
    event.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
    event.currentTarget.style.transform = "translateY(0)";
    event.currentTarget.style.borderColor = "#e0e0e0";
  };

  const favoriteButtonLabel = isFavorite
    ? "Remove from favorites"
    : "Add to favorites";

  const favoriteIcon = isFavorite ? "⭐" : "☆";

  return (
    <article
      role="button"
      tabIndex={0}
      style={cardStyle}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-pressed={isSelected}
      aria-label={`View details for ${trail?.name ?? "trail"}`}
    >
      <button
        type="button"
        onClick={handleFavoriteClick}
        disabled={loadingFavorite}
        aria-pressed={isFavorite}
        aria-label={favoriteButtonLabel}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "none",
          border: "none",
          cursor: loadingFavorite ? "not-allowed" : "pointer",
          fontSize: "24px",
          padding: "4px",
          lineHeight: "1",
          transition: "transform 0.2s",
          color: isFavorite ? "#ffc107" : "#888888",
        }}
        onMouseEnter={(event) => {
          if (!loadingFavorite) {
            event.currentTarget.style.transform = "scale(1.2)";
          }
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = "scale(1)";
        }}
      >
        {loadingFavorite ? "⏳" : favoriteIcon}
      </button>

      <h3
        style={{
          margin: "0 0 10px 0",
          color: "#2c5f2d",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        {trail?.name ?? "Unnamed Trail"}
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
        {trail?.location ?? "Location unavailable"}
      </p>

      <div
        style={{
          margin: "10px 0",
          padding: "6px 12px",
          backgroundColor: difficulty.background,
          borderRadius: "6px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span aria-hidden="true">{difficulty.emoji}</span>
        <p
          style={{
            margin: 0,
            fontWeight: "bold",
            fontSize: "14px",
            color: difficulty.color,
          }}
        >
          Difficulty: {trail?.difficulty_text ?? difficulty.label}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
          fontSize: "13px",
          color: "#666",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {trail?.length_miles ? (
          <p
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span aria-hidden="true">🥾</span>
            <strong>{trail.length_miles} mi</strong>
          </p>
        ) : null}
        {trail?.elevation_gain_ft ? (
          <p
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span aria-hidden="true">⛰️</span>
            <strong>{trail.elevation_gain_ft} ft</strong>
          </p>
        ) : null}
        {formatDuration(trail?.estimated_time_minutes) ? (
          <p
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span aria-hidden="true">⏱️</span>
            <strong>{formatDuration(trail.estimated_time_minutes)}</strong>
          </p>
        ) : null}
      </div>

      {!disableDetails && (
        <p
          style={{
            margin: "14px 0 0 0",
            fontSize: "12px",
            color: "#888",
            fontStyle: "italic",
          }}
        >
          Click to view details
        </p>
      )}
    </article>
  );
};

export default TrailCard;
