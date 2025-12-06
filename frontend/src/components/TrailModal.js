import React, { useEffect, useMemo, useRef, useState } from "react";
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

const overlayStyle = {
  position: "fixed",
  inset: "0",
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "flex-start",
  pointerEvents: "none",
  zIndex: 1500,
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "linear-gradient(140deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 45%)",
  zIndex: 1490,
  pointerEvents: "auto",
};

const panelStyle = {
  marginTop: "28px",
  marginRight: "28px",
  width: "360px",
  maxWidth: "calc(100% - 56px)",
  maxHeight: "calc(100% - 56px)",
  backgroundColor: "#fff",
  borderRadius: "18px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
  display: "flex",
  flexDirection: "column",
  pointerEvents: "auto",
  overflow: "hidden",
};

const headerStyle = {
  padding: "20px 24px 16px",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  background: "linear-gradient(145deg, #ffffff 40%, #f4faf4 100%)",
  position: "relative",
};

const closeButtonStyle = {
  position: "absolute",
  top: "18px",
  right: "18px",
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

const TrailModal = ({
  isOpen = false,
  onClose,
  trailId,
  trail,
  isFavorite = false,
  favoriteLoading = false,
  onFavoriteToggle,
}) => {
  const [trailDetails, setTrailDetails] = useState(trail || null);
  const [loading, setLoading] = useState(!trail && Boolean(trailId));
  const [error, setError] = useState(null);
  const panelRef = useRef(null);

  const activeTrailId = trail?.id ?? trailId ?? trailDetails?.id ?? null;

  useEffect(() => {
    setTrailDetails(trail || null);
  }, [trail]);

  useEffect(() => {
    if (!isOpen || !activeTrailId || (trail && trail.id === activeTrailId)) {
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
        if (!isMounted) {
          return;
        }
        setTrailDetails(response.data.trail);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }
        const message =
          err.response?.data?.message ||
          err.message ||
          "Unable to load trail details right now.";
        setError(message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTrailId, trail]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const difficultyMeta = useMemo(() => {
    const level =
      trailDetails?.difficulty ?? trail?.difficulty ?? DIFFICULTY_META[1];
    return DIFFICULTY_META[level] || DIFFICULTY_META[1];
  }, [trailDetails, trail]);

  if (!isOpen || !activeTrailId) {
    return null;
  }

  const resolvedTrail = trailDetails || trail;

  const handleFavoriteClick = () => {
    if (!onFavoriteToggle || !resolvedTrail) {
      return;
    }
    onFavoriteToggle(resolvedTrail, !isFavorite);
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
      <div style={overlayStyle} aria-live="polite">
        <div style={backdropStyle} onClick={onClose} role="presentation" />
        <aside
          ref={panelRef}
          style={panelStyle}
          role="dialog"
          aria-label="Trail details"
          aria-modal="false"
        >
          <div style={headerStyle}>
            {onClose && (
              <button
                type="button"
                style={closeButtonStyle}
                onClick={onClose}
                aria-label="Close trail details"
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "rgba(44, 95, 45, 0.18)";
                  event.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    "rgba(0, 0, 0, 0.06)";
                  event.currentTarget.style.transform = "translateY(0)";
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
                  {[0, 1, 2].map((index) => (
                    <div
                      key={`loading-tile-${index}`}
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
                      value: resolvedTrail?.location ?? "Unknown",
                    },
                    {
                      label: "Length",
                      icon: "🥾",
                      value: resolvedTrail?.length_miles
                        ? `${resolvedTrail.length_miles} miles`
                        : "Not available",
                    },
                    {
                      label: "Elevation Gain",
                      icon: "⛰️",
                      value: resolvedTrail?.elevation_gain_ft
                        ? `${resolvedTrail.elevation_gain_ft} ft`
                        : "Not available",
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

                {Array.isArray(resolvedTrail?.necessity_list) &&
                  resolvedTrail.necessity_list.length > 0 && (
                    <section>
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
                      marginTop: "20px",
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
                      if (favoriteLoading) {
                        return;
                      }
                      event.currentTarget.style.transform = "translateY(-1px)";
                      event.currentTarget.style.boxShadow =
                        "0 10px 22px rgba(44,95,45,0.24)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0)";
                      event.currentTarget.style.boxShadow = "none";
                    }}
                    aria-label={
                      isFavorite
                        ? "Remove trail from favorites"
                        : "Add trail to favorites"
                    }
                  >
                    <span aria-hidden="true">{isFavorite ? "⭐" : "☆"}</span>
                    {favoriteLoading
                      ? "Updating favorites..."
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
