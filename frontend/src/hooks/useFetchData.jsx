import { useCallback } from "react";
import api from "../api";

const useFetchData = (link, setLoading, setData) => {
  return useCallback(() => {
    setLoading(true);
    api
      .get(`api/${link}/`)
      .then((deptRes) => setData(deptRes.data))
      .catch((error) => alert(error))
      .finally(() => setLoading(false));
  }, [link, setLoading, setData]);
};

export default useFetchData;
