import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";

const Weather = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city) {
      setLoading(true);
      axios
        .get(`${API_URL}/api/weather?city=${city}`)
        .then((response) => {
          setWeather(response.data);
          setLoading(false);
        })
        .catch((err) => {
          // Silently fail - just don't show weather
          console.log("Weather data unavailable");
          setWeather(null);
          setLoading(false);
        });
    }
  }, [city]);

  if (loading) {
    return (
      <div
        style={{
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, color: "#999", fontSize: "13px" }}>
          Loading weather...
        </p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      style={{
        padding: "20px",
        marginBottom: "20px",
        backgroundColor: "#e3f2fd",
        borderRadius: "12px",
        border: "2px solid #2196f3",
        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.1)",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          color: "#1976d2",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ marginRight: "8px" }}>🌤️</span>
        Current Weather in {city}
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: "4px 0",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1565c0",
            }}
          >
            {weather.temperature}°C
          </p>
          <p
            style={{
              margin: "4px 0",
              fontSize: "16px",
              color: "#424242",
              textTransform: "capitalize",
            }}
          >
            {weather.description}
          </p>
        </div>

        {weather.icon_url && (
          <img
            src={weather.icon_url}
            alt="Weather icon"
            style={{
              width: "64px",
              height: "64px",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Weather;
