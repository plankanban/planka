/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Dropdown, Input } from 'semantic-ui-react';

import { useNestedRef } from '../../../hooks';
import WEBHOOK_EVENTS from '../../../constants/WebhookEvents';

import styles from './Editor.module.scss';

const Editor = React.forwardRef(({ data, isReadOnly, onFieldChange }, ref) => {
  const [t] = useTranslation();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');
  const [urlFieldRef, handleUrlFieldRef] = useNestedRef('inputRef');

  const focusNameField = useCallback(() => {
    nameFieldRef.current.focus({
      preventScroll: true,
    });
  }, [nameFieldRef]);

  const selectNameField = useCallback(() => {
    nameFieldRef.current.select();
  }, [nameFieldRef]);

  const selectUrlField = useCallback(() => {
    urlFieldRef.current.select();
  }, [urlFieldRef]);

  useImperativeHandle(
    ref,
    () => ({
      focusNameField,
      selectNameField,
      selectUrlField,
    }),
    [focusNameField, selectNameField, selectUrlField],
  );

  return (
    <>
      <div className={styles.text}>{t('common.title')}</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        readOnly={isReadOnly}
        className={styles.field}
        onChange={onFieldChange}
      />
      <div className={styles.text}>{t('common.url')}</div>
      <Input
        fluid
        ref={handleUrlFieldRef}
        name="url"
        value={data.url}
        maxLength={2048}
        readOnly={isReadOnly}
        className={styles.field}
        onChange={onFieldChange}
      />
      <div className={styles.text}>
        {t('common.accessToken')} (
        {t('common.optional', {
          context: 'inline',
        })}
        )
      </div>
      <Input
        fluid
        name="accessToken"
        value={data.accessToken}
        maxLength={512}
        readOnly={isReadOnly}
        className={styles.field}
        onChange={onFieldChange}
      />
      {data.excludedEvents.length === 0 && (
        <>
          <div className={styles.text}>
            {t('common.events')} (
            {t('common.optional', {
              context: 'inline',
            })}
            )
          </div>
          <Dropdown
            selection
            multiple
            fluid
            name="events"
            options={WEBHOOK_EVENTS.map((event) => ({
              text: event,
              value: event,
            }))}
            value={data.events}
            placeholder="All"
            readOnly={isReadOnly}
            className={styles.field}
            onChange={onFieldChange}
          />
        </>
      )}
      {data.events.length === 0 && (
        <>
          <div className={styles.text}>
            {t('common.excludedEvents')} (
            {t('common.optional', {
              context: 'inline',
            })}
            )
          </div>
          <Dropdown
            selection
            multiple
            fluid
            name="excludedEvents"
            options={WEBHOOK_EVENTS.map((event) => ({
              text: event,
              value: event,
            }))}
            value={data.excludedEvents}
            placeholder="None"
            readOnly={isReadOnly}
            className={styles.field}
            onChange={onFieldChange}
          />
        </>
      )}
    </>
  );
});

Editor.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isReadOnly: PropTypes.bool,
  onFieldChange: PropTypes.func.isRequired,
};

Editor.defaultProps = {
  isReadOnly: false,
};

export default React.memo(Editor);
