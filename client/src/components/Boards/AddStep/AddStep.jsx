import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Input, Popup } from '../../../lib/custom-ui';

import { useForm, useSteps } from '../../../hooks';
import ImportStep from './ImportStep';

import styles from './AddStep.module.scss';

const StepTypes = {
  IMPORT: 'IMPORT',
};

const AddStep = React.memo(({ onCreate, onClose }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm({
    name: '',
    import: null,
  });

  const [step, openStep, handleBack] = useSteps();
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

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

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.select();
      return;
    }

    onCreate(cleanData);
    onClose();
  }, [onClose, data, onCreate]);

  const handleImportClick = useCallback(() => {
    openStep(StepTypes.IMPORT);
  }, [openStep]);

  useEffect(() => {
    nameField.current.focus({
      preventScroll: true,
    });
  }, []);

  useDidUpdate(() => {
    nameField.current.focus();
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
          <Input
            fluid
            ref={nameField}
            name="name"
            value={data.name}
            className={styles.field}
            onChange={handleFieldChange}
          />
          <div className={styles.controls}>
            <Button positive content={t('action.createBoard')} className={styles.createButton} />
            <Button type="button" className={styles.importButton} onClick={handleImportClick}>
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
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddStep;
