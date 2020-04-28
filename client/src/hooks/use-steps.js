import { useCallback, useState } from 'react';

const createStep = (type, params = {}) => {
  if (!type) {
    return null;
  }

  return {
    type,
    params,
  };
};

export default (initialType, initialParams) => {
  const [step, setStep] = useState(() => createStep(initialType, initialParams));

  const open = useCallback((type, params) => {
    setStep(createStep(type, params));
  }, []);

  const handleBack = useCallback(() => {
    setStep(null);
  }, []);

  return [step, open, handleBack];
};
