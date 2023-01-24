import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import styles from './DeleteStep.module.scss';

const DeleteStep = React.memo(({ title, content, buttonContent, onConfirm, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <div className={styles.content}>{t(content)}</div>
        <Button fluid negative content={t(buttonContent)} onClick={onConfirm} />
      </Popup.Content>
    </>
  );
});

DeleteStep.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonContent: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

DeleteStep.defaultProps = {
  onBack: undefined,
};

export default DeleteStep;
