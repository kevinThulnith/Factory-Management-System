import { useState, useEffect } from "react";
import useFetchData from "./useFetchData";

const useProductionLines = () => {
  const [productionLines, setProductionLines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProductionLines = useFetchData(
    "production-line",
    setLoading,
    setProductionLines,
  );

  useEffect(() => fetchProductionLines(), [fetchProductionLines]);

  return { productionLines, loading };
};

export default useProductionLines;
