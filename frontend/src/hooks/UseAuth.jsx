import { useState, useEffect, useCallback } from "react";
import { ACCESS_TOKEN } from "../constants";
import useFetchData from "./useFetchData";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSetUser = useCallback((userData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
  }, []);

  const fetchUser = useFetchData("user/me", setLoading, handleSetUser);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
      return;
    }

    if (!localStorage.getItem(ACCESS_TOKEN)) {
      setLoading(false);
      return;
    }

    fetchUser();
  }, [fetchUser]);

  return { user, loading, setLoading };
};

export default useAuth;
