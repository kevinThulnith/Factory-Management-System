import { useCallback } from "react";
import api from "../api";

const useFetchData = (link, setLoading, setData) => {
  return useCallback(() => {
    // 1. Defend against empty strings or missing inputs
    if (!link || typeof link !== "string") {
      console.error("useFetchData: Invalid link parameter provided.");
      return;
    }

    // 2. Security Check: Block directory traversal (..) and external protocols (//, http)
    if (link.includes("..") || link.includes("//") || link.includes(":\\")) {
      console.error(`Security Alert: Blocked potentially malicious path manipulation: ${link}`);
      alert("Invalid request path configuration.");
      return;
    }

    setLoading(true);
    api
      .get(`api/${link}/`)
      .then((response) => {
        // !Handle both paginated and non-paginated responses
        const data = response.data.results || response.data;
        setData(data);
      })
      .catch((error) => {
        console.error(`Error fetching ${link}:`, error);
        alert(`Failed to fetch ${link}. Please try again.`);
      })
      .finally(() => setLoading(false));
  }, [link, setLoading, setData]);
};

export default useFetchData;
