import { useState, useEffect } from "react";
import useFetchData from "./useFetchData";

const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useFetchData(
    "department",
    setLoading,
    setDepartments,
  );

  useEffect(() => fetchDepartments(), [fetchDepartments]);

  return { departments, loading };
};

export default useDepartments;
