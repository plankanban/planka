import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Input } from '../../lib/custom-ui';

import LabelColors from '../../constants/LabelColors';

import styles from './Editor.module.scss';
import globalStyles from '../../styles.module.scss';

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
      <div className={styles.colorButtons}>
        {LabelColors.map((color) => (
          <Button
            key={color}
            type="button"
            name="color"
            value={color}
            className={classNames(
              styles.colorButton,
              color === data.color && styles.colorButtonActive,
              globalStyles[`background${upperFirst(camelCase(color))}`],
            )}
            onClick={onFieldChange}
          />
        ))}
      </div>
    </>
  );
});

Editor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onFieldChange: PropTypes.func.isRequired,
};

export default Editor;
