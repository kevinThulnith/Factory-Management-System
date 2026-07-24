import { useState, useEffect } from "react";
import useFetchData from "./useFetchData";

const useWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkshops = useFetchData("workshop", setLoading, setWorkshops);

  useEffect(() => fetchWorkshops(), [fetchWorkshops]);

  return { workshops, loading };
};

export default useWorkshops;
