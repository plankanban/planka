import { useCallback, useState } from 'react';

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((_, { name: fieldName, value }) => {
    setData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  }, []);

  return [data, handleFieldChange, setData];
};
