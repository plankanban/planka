/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import { useForm, useNestedRef } from '../../../hooks';

import styles from './ConfirmationStep.module.scss';

const ButtonTypes = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
};

const ConfirmationStep = React.memo(
  ({ title, content, buttonType, buttonContent, typeValue, typeContent, onConfirm, onBack }) => {
    const [t] = useTranslation();

    const [data, handleFieldChange] = useForm({
      typeValue: '',
    });

    const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

    const handleSubmit = useCallback(
      (event) => {
        event.stopPropagation();

        if (typeValue) {
          const cleanData = {
            ...data,
            typeValue: data.typeValue.trim(),
          };

          if (cleanData.typeValue.toLowerCase() !== typeValue.toLowerCase()) {
            nameFieldRef.current.select();
            return;
          }
        }

        onConfirm();
      },
      [typeValue, onConfirm, data, nameFieldRef],
    );

    useEffect(() => {
      if (typeValue) {
        nameFieldRef.current.select();
      }
    }, [typeValue, nameFieldRef]);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <div className={styles.content}>{t(content)}</div>
          {typeContent && <div className={styles.content}>{t(typeContent)}</div>}
          <Form onSubmit={handleSubmit}>
            {typeValue && (
              <Input
                fluid
                ref={handleNameFieldRef}
                name="typeValue"
                value={data.typeValue}
                placeholder={typeValue}
                maxLength={128}
                className={styles.field}
                onChange={handleFieldChange}
              />
            )}
            <Button
              {...{
                [buttonType]: true,
              }}
              fluid
              content={t(buttonContent)}
            />
          </Form>
        </Popup.Content>
      </>
    );
  },
);

ConfirmationStep.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonType: PropTypes.oneOf(Object.values(ButtonTypes)),
  buttonContent: PropTypes.string.isRequired,
  typeValue: PropTypes.string,
  typeContent: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ConfirmationStep.defaultProps = {
  buttonType: ButtonTypes.NEGATIVE,
  typeValue: undefined,
  typeContent: undefined,
  onBack: undefined,
};

export default ConfirmationStep;
