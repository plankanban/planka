import React from 'react';
import { useTranslation } from 'react-i18next';

function NotFound() {
  const [t] = useTranslation();

  return (
    <h1>
      {t('common.pageNotFound', {
        context: 'title',
      })}
    </h1>
  );
}

export default NotFound;
