import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Input } from '../../lib/custom-ui';

import LabelColors from '../../constants/LabelColors';
import ColorPicker from '../ColorPicker';

import styles from './Editor.module.scss';

const Editor = React.memo(({ data, onFieldChange }) => {
  const [t] = useTranslation();

  const nameField = useRef(null);

  useEffect(() => {
    nameField.current.select();
  }, []);

  return (
    <>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={nameField}
        name="name"
        value={data.name}
        className={styles.field}
        onChange={onFieldChange}
      />
      <div className={styles.text}>{t('common.color')}</div>
      <ColorPicker colors={LabelColors} current={data.color} onChange={onFieldChange} />
    </>
  );
});

Editor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onFieldChange: PropTypes.func.isRequired,
};

export default Editor;
