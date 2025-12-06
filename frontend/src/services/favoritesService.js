import axios from 'axios';
import API_URL from '../config';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
    return localStorage.getItem('token');
};

/**
 * Get all user favorites from server
 */
export const getFavorites = async () => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/api/favorites`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.favorites;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

/**
 * Add a trail to favorites
 */
export const addFavorite = async (trailId) => {
    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${API_URL}/api/favorites`,
            { trail_id: trailId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

/**
 * Remove a trail from favorites
 */
export const removeFavorite = async (trailId) => {
    try {
        const token = getAuthToken();
        const response = await axios.delete(
            `${API_URL}/api/favorites/${trailId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};
