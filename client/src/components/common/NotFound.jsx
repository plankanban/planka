/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFound = React.memo(() => {
  const [t] = useTranslation();

  return (
    <h1>
      {t('common.pageNotFound', {
        context: 'title',
      })}
    </h1>
  );
});

export default NotFound;
