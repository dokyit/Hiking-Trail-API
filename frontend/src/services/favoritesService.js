import axios from "axios";
import API_URL from "../config";

/**
 * Utilities
 */
const LOCAL_FAVORITES_KEY = "localFavorites";

const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readToken = () => {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem("token");
};

const clearToken = () => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem("token");
};

const normalizeFavoriteInput = (candidate, fallbackId) => {
  if (candidate && typeof candidate === "object") {
    const normalized = { ...candidate };
    if (typeof normalized.id === "undefined") {
      normalized.id = fallbackId;
    }
    return normalized;
  }

  return { id: fallbackId };
};

const readLocalFavorites = () => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && typeof item.id !== "undefined")
      .map((item) => normalizeFavoriteInput(item, item.id));
  } catch (error) {
    console.warn("Unable to parse local favorites. Resetting cache.", error);
    window.localStorage.removeItem(LOCAL_FAVORITES_KEY);
    return [];
  }
};

const writeLocalFavorites = (favorites) => {
  if (!isBrowser()) {
    return;
  }

  const sanitized = favorites
    .filter((fav) => fav && typeof fav.id !== "undefined")
    .map((fav) => normalizeFavoriteInput(fav, fav.id));

  window.localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(sanitized));
};

const addFavoriteLocally = (trailId, trailData) => {
  const favorites = readLocalFavorites();

  if (favorites.some((fav) => fav.id === trailId)) {
    const existing = favorites.find((fav) => fav.id === trailId);
    return {
      message: "Favorite already added",
      trail: existing,
      source: "local",
    };
  }

  const normalized = normalizeFavoriteInput(trailData, trailId);
  const updated = [...favorites, normalized];
  writeLocalFavorites(updated);

  return {
    message: "Favorite added",
    trail: normalized,
    source: "local",
  };
};

const removeFavoriteLocally = (trailId) => {
  const favorites = readLocalFavorites();
  const updated = favorites.filter((fav) => fav.id !== trailId);
  writeLocalFavorites(updated);

  return {
    message: "Favorite removed",
    source: "local",
  };
};

const handleAuthFailure = (context) => {
  if (context && typeof console !== "undefined") {
    console.warn(`[favorites] Falling back to local cache because ${context}.`);
  }
  clearToken();
  return readLocalFavorites();
};

const isUnauthorized = (error) => {
  const status = error?.response?.status;
  return status === 401 || status === 403;
};

const coerceServerFavorites = (payload) => {
  if (Array.isArray(payload)) {
    return payload
      .filter((item) => item && typeof item.id !== "undefined")
      .map((item) => normalizeFavoriteInput(item, item.id));
  }

  if (payload && typeof payload === "object") {
    return Object.values(payload)
      .filter((item) => item && typeof item.id !== "undefined")
      .map((item) => normalizeFavoriteInput(item, item.id));
  }

  return [];
};

/**
 * Public API
 */
export const getFavorites = async () => {
  const token = readToken();

  if (!token) {
    return readLocalFavorites();
  }

  try {
    const response = await axios.get(`${API_URL}/api/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return coerceServerFavorites(response?.data?.favorites);
  } catch (error) {
    if (isUnauthorized(error)) {
      return handleAuthFailure(
        "the server returned an unauthorized response while fetching favorites",
      );
    }

    console.error("Error fetching favorites:", error);
    throw error;
  }
};

export const addFavorite = async (trailId, trailData = null) => {
  const token = readToken();

  if (!token) {
    return addFavoriteLocally(trailId, trailData);
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/favorites`,
      { trail_id: trailId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const payload = response?.data ?? {};
    if (!payload.trail) {
      payload.trail = normalizeFavoriteInput(trailData, trailId);
    }
    if (!payload.source) {
      payload.source = "remote";
    }
    return payload;
  } catch (error) {
    if (isUnauthorized(error)) {
      handleAuthFailure(
        "the server returned an unauthorized response while adding a favorite",
      );
      return addFavoriteLocally(trailId, trailData);
    }

    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeFavorite = async (trailId) => {
  const token = readToken();

  if (!token) {
    return removeFavoriteLocally(trailId);
  }

  try {
    const response = await axios.delete(`${API_URL}/api/favorites/${trailId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = response?.data ?? {};
    if (!payload.source) {
      payload.source = "remote";
    }
    return payload;
  } catch (error) {
    if (isUnauthorized(error)) {
      handleAuthFailure(
        "the server returned an unauthorized response while removing a favorite",
      );
      return removeFavoriteLocally(trailId);
    }

    console.error("Error removing favorite:", error);
    throw error;
  }
};
