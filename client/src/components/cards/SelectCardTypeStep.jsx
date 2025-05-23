/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import SelectCardType from './SelectCardType';

const SelectCardTypeStep = React.memo(
  ({ defaultValue, title, withButton, buttonContent, onSelect, onBack, onClose }) => {
    const [t] = useTranslation();
    const [value, setValue] = useState(defaultValue);

    const handleSelect = useCallback(
      (nextValue) => {
        if (withButton) {
          setValue(nextValue);
        } else {
          if (nextValue !== defaultValue) {
            onSelect(nextValue);
          }

          onClose();
        }
      },
      [defaultValue, withButton, onSelect, onClose],
    );

    const handleSubmit = useCallback(() => {
      if (value !== defaultValue) {
        onSelect(value);
      }

      onClose();
    }, [defaultValue, onSelect, onClose, value]);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <SelectCardType value={value} onSelect={handleSelect} />
            {withButton && <Button positive content={t(buttonContent)} />}
          </Form>
        </Popup.Content>
      </>
    );
  },
);

SelectCardTypeStep.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  title: PropTypes.string,
  withButton: PropTypes.bool,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

SelectCardTypeStep.defaultProps = {
  title: 'common.selectType',
  withButton: false,
  buttonContent: 'action.selectType',
  onBack: undefined,
};

export default SelectCardTypeStep;
