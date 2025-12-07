import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import axios from "axios";
import API_URL from "../config";

const DIFFICULTY_META = {
  1: {
    label: "Easy",
    color: "#28a745",
    accent: "rgba(40, 167, 69, 0.14)",
    emoji: "🟢",
  },
  2: {
    label: "Moderate",
    color: "#ffc107",
    accent: "rgba(255, 193, 7, 0.18)",
    emoji: "🟡",
  },
  3: {
    label: "Hard",
    color: "#fd7e14",
    accent: "rgba(253, 126, 20, 0.18)",
    emoji: "🟠",
  },
  4: {
    label: "Extremely Hard",
    color: "#dc3545",
    accent: "rgba(220, 53, 69, 0.18)",
    emoji: "🔴",
  },
};

// Main container covers screen but lets clicks pass through
const overlayStyle = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none", // Allows clicking on the map behind
  zIndex: 1500,
};

const panelBaseStyle = {
  position: "fixed",
  width: "360px",
  backgroundColor: "#ffffff",
  borderRadius: "18px",
  boxShadow: "0 22px 44px rgba(0,0,0,0.28)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  pointerEvents: "auto", // Re-enables clicking inside the modal
  touchAction: "none",
  maxHeight: "calc(100vh - 32px)", // Prevent it being taller than screen
};

const headerStyle = {
  padding: "20px 24px 16px",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  background: "linear-gradient(145deg, #ffffff 40%, #f4faf4 100%)",
  position: "relative",
  cursor: "grab",
  flexShrink: 0,
};

const closeButtonStyle = {
  position: "absolute",
  top: "16px",
  right: "16px",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: "none",
  backgroundColor: "rgba(0,0,0,0.06)",
  cursor: "pointer",
  color: "#2d352d",
  fontSize: "18px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s ease, transform 0.2s ease",
};

const bodyStyle = {
  padding: "22px 24px",
  overflowY: "auto",
  flex: 1,
};

const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "14px",
  marginBottom: "22px",
};

const metaTileStyle = {
  backgroundColor: "#f6faf6",
  borderRadius: "12px",
  border: "1px solid rgba(44, 95, 45, 0.14)",
  padding: "12px 14px",
};

const chipListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const chipStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  borderRadius: "9px",
  border: "1px solid rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
};

const shimmerStyle = {
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.08) 100%)",
  backgroundSize: "220% 100%",
  animation: "trail-modal-shimmer 1.8s infinite",
  borderRadius: "10px",
};

const marginBounds = 16;

const hasEssentialDetails = (trailData) => {
  if (!trailData || typeof trailData !== "object") return false;
  const hasDescription =
    typeof trailData.description === "string" &&
    trailData.description.trim().length > 0;
  const necessityList = Array.isArray(trailData.necessity_list)
    ? trailData.necessity_list
    : null;
  return hasDescription && necessityList !== null;
};

// Helper to format minutes into "1h 30m" or "45m"
const formatDuration = (minutes) => {
  if (!minutes) return "N/A";
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const TrailModal = ({
  isOpen = false,
  onClose,
  trailId,
  trail,
  isFavorite = false,
  favoriteLoading = false,
  onFavoriteToggle,
}) => {
  const panelRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [trailDetails, setTrailDetails] = useState(trail || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: -1000, y: marginBounds });

  const activeTrailId =
    (trail && trail.id) || trailId || (trailDetails && trailDetails.id) || null;

  // --- Sync State ---
  useEffect(() => {
    if (!trail) return;
    setTrailDetails((prev) => {
      if (!prev || prev.id !== trail.id) return trail;
      return { ...prev, ...trail };
    });
  }, [trail, activeTrailId]);

  // --- Fetch Data ---
  useEffect(() => {
    if (!isOpen || !activeTrailId) return;

    const currentData =
      (trail && trail.id === activeTrailId ? trail : null) ||
      (trailDetails && trailDetails.id === activeTrailId ? trailDetails : null);

    const isDataComplete = currentData && hasEssentialDetails(currentData);

    if (isDataComplete) {
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(`${API_URL}/api/trails/${activeTrailId}`)
      .then((response) => {
        if (!isMounted) return;
        setTrailDetails(response.data.trail);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to fetch trail details:", err);
        setError("Unable to load additional details.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTrailId]);

  // --- Positioning Logic (Right Side Snap) ---
  useLayoutEffect(() => {
    if (isOpen) {
      const winWidth = window.innerWidth;
      // Snap to right side: Window width - Panel width (360) - Margin (16)
      const newX = winWidth - 360 - marginBounds;
      const newY = marginBounds;

      setPosition({
        x: Math.max(marginBounds, newX),
        y: newY,
      });
    }
  }, [isOpen]);

  // --- Dragging Logic ---
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (event) => {
      const deltaX = event.clientX - dragOffsetRef.current.initialMouseX;
      const deltaY = event.clientY - dragOffsetRef.current.initialMouseY;

      let nextX = dragOffsetRef.current.initialPosX + deltaX;
      let nextY = dragOffsetRef.current.initialPosY + deltaY;

      // Basic bounds check
      const panel = panelRef.current;
      if (panel) {
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        nextX = Math.min(Math.max(nextX, -panel.offsetWidth + 50), maxX);
        nextY = Math.min(Math.max(nextY, 0), maxY);
      }

      setPosition({ x: nextX, y: nextY });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (event) => {
    if (!panelRef.current || event.button !== 0) return;
    const target = event.target;
    if (target.closest("button") || target.closest('[role="button"]')) return;

    dragOffsetRef.current = {
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
    };
    setIsDragging(true);
    event.preventDefault();
  };

  const resolvedTrail = trailDetails || trail;
  const level = resolvedTrail?.difficulty || 1;
  const difficultyMeta = DIFFICULTY_META[level] || DIFFICULTY_META[1];

  if (!isOpen || !activeTrailId) return null;

  const handleFavoriteClick = () => {
    if (onFavoriteToggle && resolvedTrail) {
      onFavoriteToggle(resolvedTrail, !isFavorite);
    }
  };

  const panelStyle = {
    ...panelBaseStyle,
    top: position.y,
    left: position.x,
    cursor: isDragging ? "grabbing" : "default",
  };

  return (
    <>
      <style>
        {`@keyframes trail-modal-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>

      {/* No backdrop div here, just the container for positioning */}
      <div style={overlayStyle}>
        <aside
          ref={panelRef}
          style={panelStyle}
          role="dialog"
          aria-label="Trail details"
          aria-modal="false"
        >
          {/* Header is the Drag Handle */}
          <div style={headerStyle} onMouseDown={handleDragStart}>
            {onClose && (
              <button
                type="button"
                style={closeButtonStyle}
                onClick={onClose}
                aria-label="Close trail details"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(44, 95, 45, 0.18)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                ×
              </button>
            )}
            <div style={{ paddingRight: onClose ? "46px" : "0" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "rgba(60,70,60,0.7)",
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                Featured Trail
              </p>
              <h2
                style={{
                  margin: "6px 0 12px",
                  fontSize: "24px",
                  lineHeight: 1.3,
                  color: "#2c5f2d",
                  fontWeight: 700,
                  userSelect: "none",
                }}
              >
                {resolvedTrail?.name || "Loading trail..."}
              </h2>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: difficultyMeta.accent,
                color: difficultyMeta.color,
                fontWeight: 600,
                fontSize: "14px",
                userSelect: "none",
              }}
            >
              <span aria-hidden="true">{difficultyMeta.emoji}</span>
              <span>
                Difficulty:{" "}
                {resolvedTrail?.difficulty_text || difficultyMeta.label}
              </span>
            </div>
          </div>

          <div style={bodyStyle}>
            {loading ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <div
                  style={{ ...shimmerStyle, height: "20px", width: "70%" }}
                />
                <div
                  style={{ ...shimmerStyle, height: "20px", width: "85%" }}
                />
                <div style={metaGridStyle}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={`loading-${i}`}
                      style={{
                        ...shimmerStyle,
                        height: "72px",
                        borderRadius: "12px",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{ ...shimmerStyle, height: "140px", width: "100%" }}
                />
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(220, 53, 69, 0.25)",
                  backgroundColor: "rgba(220, 53, 69, 0.12)",
                  color: "#931b24",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>
                  Unable to load trail details
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "14px" }}>{error}</p>
              </div>
            ) : (
              <>
                <div style={metaGridStyle}>
                  {[
                    {
                      label: "Location",
                      icon: "📍",
                      value: resolvedTrail?.location || "Unknown",
                    },
                    {
                      label: "Length",
                      icon: "🥾",
                      value: resolvedTrail?.length_miles
                        ? `${resolvedTrail.length_miles} miles`
                        : "N/A",
                    },
                    /* -- ADDED EST. TIME HERE -- */
                    {
                      label: "Est. Time",
                      icon: "⏱️",
                      value: formatDuration(
                        resolvedTrail?.estimated_time_minutes,
                      ),
                    },
                    /* -- ELEVATION IS NOW BELOW IT -- */
                    {
                      label: "Elevation",
                      icon: "⛰️",
                      value: resolvedTrail?.elevation_gain_ft
                        ? `${resolvedTrail.elevation_gain_ft} ft`
                        : "N/A",
                    },
                  ].map((tile) => (
                    <div key={tile.label} style={metaTileStyle}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "rgba(48,56,48,0.66)",
                          fontWeight: 600,
                        }}
                      >
                        {tile.icon} {tile.label}
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#2c392c",
                        }}
                      >
                        {tile.value}
                      </p>
                    </div>
                  ))}
                </div>

                {resolvedTrail?.description && (
                  <section style={{ marginBottom: "24px" }}>
                    <h3
                      style={{
                        margin: "0 0 12px",
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#2c5f2d",
                      }}
                    >
                      Trail Overview
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: 1.6,
                        color: "rgba(0,0,0,0.75)",
                      }}
                    >
                      {resolvedTrail.description}
                    </p>
                  </section>
                )}

                {resolvedTrail?.necessity_list &&
                  resolvedTrail.necessity_list.length > 0 && (
                    <section style={{ marginBottom: "24px" }}>
                      <h3
                        style={{
                          margin: "0 0 12px",
                          fontSize: "17px",
                          fontWeight: 700,
                          color: "#2c5f2d",
                        }}
                      >
                        What to Bring
                      </h3>
                      <ul style={chipListStyle}>
                        {resolvedTrail.necessity_list.map((item, index) => (
                          <li key={`${item}-${index}`} style={chipStyle}>
                            <span
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(40,167,69,0.12)",
                                color: "#1f7b3b",
                                fontWeight: 700,
                              }}
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                            <span
                              style={{
                                color: "#2f3c2f",
                                fontSize: "14px",
                                lineHeight: 1.4,
                              }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                {onFavoriteToggle && resolvedTrail && (
                  <button
                    type="button"
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                    style={{
                      marginTop: "8px",
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: isFavorite
                        ? "1px solid rgba(255, 193, 7, 0.45)"
                        : "none",
                      backgroundColor: isFavorite
                        ? "rgba(255, 214, 70, 0.35)"
                        : "#2c5f2d",
                      color: isFavorite ? "#6c5400" : "#ffffff",
                      fontWeight: 600,
                      fontSize: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: favoriteLoading ? "not-allowed" : "pointer",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                    }}
                    onMouseEnter={(event) => {
                      if (favoriteLoading) return;
                      event.currentTarget.style.transform = "translateY(-1px)";
                      event.currentTarget.style.boxShadow =
                        "0 10px 22px rgba(44,95,45,0.24)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0)";
                      event.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span aria-hidden="true">{isFavorite ? "⭐" : "☆"}</span>
                    {favoriteLoading
                      ? "Updating..."
                      : isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default TrailModal;
