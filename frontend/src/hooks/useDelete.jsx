import { useCallback } from "react";
import api from "../api";

function useDelete(text, setLoading, url, fetchData) {
  const handleDelete = useCallback(
    (id) => {
      if (window.confirm(`Are you sure you want to delete this ${text}?`)) {
        setLoading(true);
        api
          .delete(`api/${url}/${id}/`)
          .then(() => {
            alert(`${text} deleted successfully !!!`);
            fetchData();
          })
          .catch((error) => {
            if (error.response && error.response.status === 400) {
              alert(`Cannot delete ${text} !!!`);
            } else {
              alert("An error occurred. Please try again later.");
            }
          })
          .finally(() => setLoading(false));
      }
    },
    [text, setLoading, url, fetchData]
  );

  return handleDelete;
}

export default useDelete;
