import { useCallback } from "react";

const useEntityFormData = (setEntity, setFormData, defaults) => {
  return useCallback(
    (data) => {
      setEntity(data);
      const formData = Object.fromEntries(
        Object.keys(defaults).map((key) => [key, data[key] || defaults[key]]),
      );
      setFormData(formData);
    },
    [setEntity, setFormData, defaults],
  );
};

export default useEntityFormData;
