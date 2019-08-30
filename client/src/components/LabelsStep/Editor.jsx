import React, {
  useCallback, useEffect, useImperativeHandle, useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { Input } from '../../lib/custom-ui';

import LabelColors from '../../constants/LabelColors';

import styles from './Editor.module.css';

const Editor = React.forwardRef(({ data, onFieldChange }, ref) => {
  const [t] = useTranslation();

  const nameField = useRef(null);

  const selectNameField = useCallback(() => {
    nameField.current.select();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      selectNameField,
    }),
    [selectNameField],
  );

  useEffect(() => {
    selectNameField();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        {LabelColors.PAIRS.map(([name, hex]) => (
          <Button
            key={name}
            type="button"
            name="color"
            value={name}
            className={classNames(
              styles.colorButton,
              name === data.color && styles.colorButtonActive,
            )}
            style={{
              background: hex,
            }}
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

export default React.memo(Editor);
