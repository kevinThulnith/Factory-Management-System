import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import api from "../api";

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setIsAuthenticated(false);

    if (refreshToken) {
      api
        .post("/api/token/blacklist/", { refresh: refreshToken })
        .catch((err) =>
          console.log(
            err.response?.status === 401 ? "Token already blacklisted" : err
          )
        );
    }

    navigate("/login");
    return () => (didRunRef.current = false);
  }, [navigate, setIsAuthenticated]);

  return null;
}

Logout.propTypes = { setIsAuthenticated: PropTypes.func.isRequired };
export default Logout;
