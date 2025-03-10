"use client"; // Ensure this component only runs on the client side
import { useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const InstallBootstrap = () => {
  useEffect(() => {
    // Dynamically import Bootstrap's JavaScript
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then((bootstrap) => {
       // console.log("Bootstrap JS loaded successfully!");
      })
      .catch((error) => {
        console.error("Failed to load Bootstrap JS:", error);
      });
  }, []);

  return null; // This component doesn't render anything
};

export default InstallBootstrap;