import React, { useState, useEffect } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import API_URL from "../config";

// Import your downloaded JSON files here
// Make sure you put them in src/assets/weather/
import sunAnimation from "../assets/weather/sun.json";
import cloudAnimation from "../assets/weather/cloud.json";
import rainAnimation from "../assets/weather/rain.json";
import snowAnimation from "../assets/weather/snow.json";
import thunderAnimation from "../assets/weather/thunder.json";

// Helper to pick the right animation based on the API description
const getWeatherAnimation = (description) => {
  if (!description) return cloudAnimation; // Default

  const desc = description.toLowerCase();

  if (desc.includes("sun") || desc.includes("clear")) return sunAnimation;
  if (
    desc.includes("rain") ||
    desc.includes("drizzle") ||
    desc.includes("shower")
  )
    return rainAnimation;
  if (
    desc.includes("snow") ||
    desc.includes("ice") ||
    desc.includes("blizzard")
  )
    return snowAnimation;
  if (desc.includes("thunder") || desc.includes("storm"))
    return thunderAnimation;
  if (
    desc.includes("cloud") ||
    desc.includes("overcast") ||
    desc.includes("mist") ||
    desc.includes("fog")
  )
    return cloudAnimation;

  return cloudAnimation; // Fallback
};

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
          console.log("Weather data unavailable");
          setWeather(null);
          setLoading(false);
        });
    }
  }, [city]);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100px",
            color: "#666",
          }}
        >
          Loading weather...
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>Current Weather in {city}</h3>

      <div style={flexContainerStyle}>
        <div>
          <p style={tempStyle}>{weather.temperature}°C</p>
          <p style={descStyle}>{weather.description}</p>
        </div>

        {/* Replaces the static <img> with the Lottie Animation */}
        <div style={{ width: "80px", height: "80px" }}>
          <Lottie
            animationData={getWeatherAnimation(weather.description)}
            loop={true}
            autoplay={true}
          />
        </div>
      </div>
    </div>
  );
};

// Styles (Updated to match your new "Clean/Poppins" look)
const containerStyle = {
  padding: "24px",
  marginBottom: "24px",
  backgroundColor: "#ffffff", // Clean white background
  borderRadius: "16px",
  border: "1px solid #eef2f6", // Very subtle border
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)", // Soft shadow
  fontFamily: "'Poppins', sans-serif",
};

const headerStyle = {
  margin: "0 0 16px 0",
  color: "#64748b", // Muted slate color
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const flexContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const tempStyle = {
  margin: "0",
  fontSize: "42px",
  fontWeight: "700",
  color: "#0f172a", // Dark navy/black
  letterSpacing: "-1px",
};

const descStyle = {
  margin: "4px 0 0 0",
  fontSize: "15px",
  color: "#64748b",
  textTransform: "capitalize",
  fontWeight: "500",
};

export default Weather;
