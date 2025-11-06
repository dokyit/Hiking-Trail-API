import React, { useState, useEffect } from "react";
import axios from "axios";
import TrailCard from "../components/TrailCard";
import NavBar from "../components/NavBar";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get("/api/favorites");
        setFavorites(res.data.favorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (trailId, isFavorite) => {
    setFavorites((prev) => prev.filter((trail) => trail.id !== trailId));
  };

  return (
    <div>
      <NavBar />
      <h2>My Favorite Trails</h2>
      <div>
        {favorites.length > 0 ? (
          favorites.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              isFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))
        ) : (
          <p>You have not favorited any trails yet.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
