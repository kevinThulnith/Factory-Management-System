import { useState, useEffect } from "react";
import useFetchData from "./useFetchData";

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useFetchData("project", setLoading, setProjects);

  useEffect(() => fetchProjects(), [fetchProjects]);

  return { projects, loading };
};

export default useProjects;
