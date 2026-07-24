import { useState, useEffect } from "react";
import useFetchData from "./useFetchData";

const useMaterials = () => {
  const [materials, setMaterial] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useFetchData("material", setLoading, setMaterial);

  useEffect(() => fetchMaterials(), [fetchMaterials]);

  return { materials, loading };
};

export default useMaterials;
