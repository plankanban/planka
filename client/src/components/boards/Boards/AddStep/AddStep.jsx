/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../../lib/hooks';
import { Input, Popup } from '../../../../lib/custom-ui';

import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef, useSteps } from '../../../../hooks';
import ImportStep from './ImportStep';

import styles from './AddStep.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const AddStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createBoardInCurrentProject(cleanData));
    onClose();
  }, [onClose, dispatch, data, nameFieldRef]);

  const handleImportSelect = useCallback(
    (nextImport) => {
      setData((prevData) => ({
        ...prevData,
        import: nextImport,
      }));
    },
    [setData],
  );

  const handleImportBack = useCallback(() => {
    handleBack();
    focusNameField();
  }, [handleBack, focusNameField]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  useEffect(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  if (step && step.type === StepTypes.IMPORT) {
    return <ImportStep onSelect={handleImportSelect} onBack={handleImportBack} />;
  }

  return (
    <>
      <Popup.Header>
        {t('common.createBoard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.title')}</div>
          <Input
            fluid
            ref={handleNameFieldRef}
            name="name"
            value={data.name}
            maxLength={128}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.controls}>
            <Button positive content={t('action.createBoard')} className={styles.button} />
            <Button
              type="button"
              className={classNames(styles.button, styles.importButton)}
              onClick={handleImportClick}
            >
              <Icon
                name={data.import ? data.import.type : 'arrow down'}
                className={styles.importButtonIcon}
              />
              {data.import ? data.import.file.name : t('action.import')}
            </Button>
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddStep;
