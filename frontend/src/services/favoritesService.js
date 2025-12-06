import axios from "axios";
import API_URL from "../config";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getFavorites = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "No auth token found while fetching favorites. Returning empty list.",
      );
      return [];
    }
    const response = await axios.get(`${API_URL}/api/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.favorites;
  } catch (error) {
    console.error("Error fetching favorites:", error);

    throw error;
  }
};

export const addFavorite = async (trailId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      const error = new Error("Authentication required to add favorites.");

      error.response = {
        status: 401,
        data: { message: "Authentication required to add favorites." },
      };
      throw error;
    }

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

    return response.data;
  } catch (error) {
    console.error("Error adding favorite:", error);

    throw error;
  }
};

export const removeFavorite = async (trailId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      const error = new Error("Authentication required to remove favorites.");

      error.response = {
        status: 401,
        data: { message: "Authentication required to remove favorites." },
      };
      throw error;
    }

    const response = await axios.delete(`${API_URL}/api/favorites/${trailId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error removing favorite:", error);

    throw error;
  }
};
