import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { APIProvider } from "@vis.gl/react-google-maps";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </APIProvider>
  );
}

export default App;
