import { useState, useCallback } from "react";
import api from "../api";

const useFormSubmit = () => {
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [errors, setErrors] = useState({});

  const submit = useCallback(
    (e, { method, url, payload, formData, message, onSuccess }) => {
      e.preventDefault();
      setLoading(true);
      setPageError("");
      setErrors({});

      return api[method](url, payload)
        .then(() => {
          alert(message);
          onSuccess?.();
        })
        .catch((err) => {
          console.error("Form submission error:", err.response);
          const apiErrors = err.response?.data || {};

          const newErrors = Object.fromEntries(
            Object.entries(apiErrors)
              .filter(([k, v]) => k in formData && Array.isArray(v))
              .map(([k, v]) => [k, v.join(" ")]),
          );

          setErrors(newErrors);
          setPageError(
            Object.keys(newErrors).length > 0
              ? "Please correct the errors below."
              : apiErrors.detail || "An error occurred. Please try again.",
          );
        })
        .finally(() => setLoading(false));
    },
    [],
  );

  return { loading, errors, pageError, setErrors, submit };
};

export default useFormSubmit;
