import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Ruler,
  Mountain,
  Clock,
  Check,
  Star,
  Loader2,
} from "lucide-react";

const DIFFICULTY_META = {
  1: { label: "Easy", color: "#28a745", background: "#e8f5e9" },
  2: { label: "Moderate", color: "#ffc107", background: "#fff8e1" },
  3: { label: "Hard", color: "#fd7e14", background: "#fff3e0" },
  4: { label: "Expert", color: "#dc3545", background: "#fce8e8" },
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 1500,
};

const panelBaseStyle = {
  position: "fixed",
  width: "380px", // Slightly wider for better readability
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", // Deep shadow
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  pointerEvents: "auto",
  touchAction: "none",
  maxHeight: "calc(100vh - 40px)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const headerStyle = {
  padding: "24px 24px 16px",
  background: "#ffffff",
  position: "relative",
  cursor: "grab",
  flexShrink: 0,
  borderBottom: "1px solid #f0f0f0",
};

const bodyStyle = {
  padding: "24px",
  overflowY: "auto",
  flex: 1,
  backgroundColor: "#fcfcfc",
};

const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "12px",
  marginBottom: "24px",
};

const metaTileStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const chipListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const marginBounds = 20;

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
  const [position, setPosition] = useState({ x: -2000, y: marginBounds });

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
        setError("Unable to load additional details.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTrailId]);

  // --- Positioning Logic (Snap to Right) ---
  useLayoutEffect(() => {
    if (isOpen) {
      const winWidth = window.innerWidth;
      const newX = winWidth - 380 - marginBounds; // 380 is new width
      setPosition({ x: Math.max(marginBounds, newX), y: marginBounds });
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
    <div style={overlayStyle}>
      <AnimatePresence>
        {isOpen && activeTrailId && (
          <motion.aside
            key="modal"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            initial={{ x: 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={panelStyle}
          >
            {/* Header */}
            <div style={headerStyle} onMouseDown={handleDragStart}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                  e.currentTarget.style.color = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <X size={18} />
              </button>

              <div style={{ paddingRight: "40px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: difficultyMeta.color,
                    }}
                  >
                    {resolvedTrail?.difficulty_text || difficultyMeta.label}
                  </span>
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: difficultyMeta.color,
                    }}
                  />
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#1a202c",
                    lineHeight: 1.2,
                  }}
                >
                  {resolvedTrail?.name || "Loading..."}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div style={bodyStyle}>
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                  }}
                >
                  <Loader2 size={32} className="spin-anim" color="#2c5f2d" />
                  <p
                    style={{
                      marginTop: "12px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Fetching trail details...
                  </p>
                </div>
              ) : error ? (
                <div
                  style={{
                    padding: "16px",
                    background: "#fef2f2",
                    color: "#991b1b",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              ) : (
                <>
                  {/* Meta Grid */}
                  <div style={metaGridStyle}>
                    <div style={metaTileStyle}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        <Ruler size={14} /> Length
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#0f172a",
                        }}
                      >
                        {resolvedTrail?.length_miles
                          ? `${resolvedTrail.length_miles} mi`
                          : "--"}
                      </span>
                    </div>

                    <div style={metaTileStyle}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        <Clock size={14} /> Est. Time
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#0f172a",
                        }}
                      >
                        {formatDuration(resolvedTrail?.estimated_time_minutes)}
                      </span>
                    </div>

                    <div style={{ ...metaTileStyle, gridColumn: "span 2" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        <Mountain size={14} /> Elevation Gain
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#0f172a",
                        }}
                      >
                        {resolvedTrail?.elevation_gain_ft
                          ? `${resolvedTrail.elevation_gain_ft} ft`
                          : "--"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {resolvedTrail?.description && (
                    <div style={{ marginBottom: "24px" }}>
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#334155",
                          marginBottom: "8px",
                          textTransform: "uppercase",
                        }}
                      >
                        Overview
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: "1.6",
                          color: "#475569",
                          margin: 0,
                        }}
                      >
                        {resolvedTrail.description}
                      </p>
                    </div>
                  )}

                  {/* Necessity List */}
                  {resolvedTrail?.necessity_list &&
                    resolvedTrail.necessity_list.length > 0 && (
                      <div style={{ marginBottom: "24px" }}>
                        <h3
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#334155",
                            marginBottom: "12px",
                            textTransform: "uppercase",
                          }}
                        >
                          What to Bring
                        </h3>
                        <ul style={chipListStyle}>
                          {resolvedTrail.necessity_list.map((item, index) => (
                            <li
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px",
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                border: "1px solid #f1f5f9",
                              }}
                            >
                              <div
                                style={{
                                  background: "#dcfce7",
                                  borderRadius: "50%",
                                  padding: "4px",
                                }}
                              >
                                <Check
                                  size={12}
                                  color="#15803d"
                                  strokeWidth={3}
                                />
                              </div>
                              <span
                                style={{ fontSize: "14px", color: "#334155" }}
                              >
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Favorite Button */}
                  {onFavoriteToggle && resolvedTrail && (
                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      disabled={favoriteLoading}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: isFavorite ? "#fffbeb" : "#1e293b",
                        color: isFavorite ? "#b45309" : "#ffffff",
                        fontWeight: "600",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: favoriteLoading ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <Star size={18} fill={isFavorite ? "#b45309" : "none"} />
                      {favoriteLoading
                        ? "Updating..."
                        : isFavorite
                          ? "Saved to Favorites"
                          : "Add to Favorites"}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrailModal;
