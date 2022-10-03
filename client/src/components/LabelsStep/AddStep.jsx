import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import LabelColors from '../../constants/LabelColors';
import Editor from './Editor';

import styles from './AddStep.module.scss';

const AddStep = React.memo(({ defaultData, onCreate, onBack }) => {
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    color: LabelColors[0],
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    onCreate(cleanData);
    onBack();
  }, [data, onCreate, onBack]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.createLabel', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Form onSubmit={handleSubmit}>
          <Editor data={data} onFieldChange={handleFieldChange} />
          <Button positive content={t('action.createLabel')} className={styles.submitButton} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AddStep;
