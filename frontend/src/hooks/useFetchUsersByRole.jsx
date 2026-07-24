import { useCallback, useRef } from "react";
import useFetchData from "./useFetchData";

const useFetchUsersByRole = (roles, setLoading, setData) => {
  // !Keep a stable reference as long as contents don't actually change
  const rolesRef = useRef(roles);
  const changed =
    rolesRef.current.length !== roles.length ||
    rolesRef.current.some((r, i) => r !== roles[i]);
  if (changed) rolesRef.current = roles;
  const stableRoles = rolesRef.current;

  const handleData = useCallback(
    (data) => {
      if (!stableRoles || stableRoles.length === 0) {
        setData(data);
        return;
      }
      const filtered = data.filter(({ role }) => stableRoles.includes(role));
      setData(filtered);
    },
    [stableRoles, setData],
  );

  return useFetchData("user", setLoading, handleData);
};

export default useFetchUsersByRole;
