import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import ProjectContainer from '../containers/ProjectContainer';

const ProjectWrapper = React.memo(({ isProjectNotFound, isBoardNotFound, isCardNotFound }) => {
  const [t] = useTranslation();

  if (isCardNotFound) {
    return (
      <h1>
        {t('common.cardNotFound', {
          context: 'title',
        })}
      </h1>
    );
  }

  if (isBoardNotFound) {
    return (
      <h1>
        {t('common.boardNotFound', {
          context: 'title',
        })}
      </h1>
    );
  }

  if (isProjectNotFound) {
    return (
      <h1>
        {t('common.projectNotFound', {
          context: 'title',
        })}
      </h1>
    );
  }

  return <ProjectContainer />;
});

ProjectWrapper.propTypes = {
  isProjectNotFound: PropTypes.bool.isRequired,
  isBoardNotFound: PropTypes.bool.isRequired,
  isCardNotFound: PropTypes.bool.isRequired,
};

export default ProjectWrapper;
