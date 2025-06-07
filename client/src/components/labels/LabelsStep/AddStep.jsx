/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import entryActions from '../../../entry-actions';
import { useForm } from '../../../hooks';
import LABEL_COLORS from '../../../constants/LabelColors';
import Editor from './Editor';

const AddStep = React.memo(({ cardId, defaultData, onBack }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange] = useForm(() => ({
    name: '',
    color: LABEL_COLORS[0],
    ...defaultData,
  }));

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim() || null,
    };

    dispatch(
      cardId
        ? entryActions.createLabelFromCard(cardId, cleanData)
        : entryActions.createLabelInCurrentBoard(cleanData),
    );

    onBack();
  }, [cardId, onBack, data, dispatch]);

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
          <Button positive content={t('action.createLabel')} />
        </Form>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  cardId: PropTypes.string,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onBack: PropTypes.func.isRequired,
};

AddStep.defaultProps = {
  cardId: undefined,
};

export default AddStep;
