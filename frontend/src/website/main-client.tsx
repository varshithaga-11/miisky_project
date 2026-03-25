import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App-client";

// Import website CSS and styles
import "./website.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
