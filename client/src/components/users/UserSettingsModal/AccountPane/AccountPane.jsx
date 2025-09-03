/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Dropdown, Header, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { usePopupInClosableContext } from '../../../../hooks';
import locales from '../../../../locales';
import EditAvatarStep from './EditAvatarStep';
import EditUserInformation from '../../EditUserInformation';
import EditUserUsernameStep from '../../EditUserUsernameStep';
import EditUserEmailStep from '../../EditUserEmailStep';
import EditUserPasswordStep from '../../EditUserPasswordStep';
import UserAvatar from '../../UserAvatar';

import styles from './AccountPane.module.scss';

const AccountPane = React.memo(() => {
  const user = useSelector(selectors.selectCurrentUser);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleLanguageChange = useCallback(
    (_, { value }) => {
      // FIXME: hack
      dispatch(entryActions.updateCurrentUserLanguage(value === 'auto' ? null : value));
    },
    [dispatch],
  );

  const EditAvatarPopup = usePopupInClosableContext(EditAvatarStep);
  const EditUserUsernamePopup = usePopupInClosableContext(EditUserUsernameStep);
  const EditUserEmailPopup = usePopupInClosableContext(EditUserEmailStep);
  const EditUserPasswordPopup = usePopupInClosableContext(EditUserPasswordStep);

  const isUsernameEditable = !user.lockedFieldNames.includes('username');
  const isEmailEditable = !user.lockedFieldNames.includes('email');
  const isPasswordEditable = !user.lockedFieldNames.includes('password');

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <EditAvatarPopup>
        <UserAvatar id={user.id} size="massive" isDisabled={user.isAvatarUpdating} />
      </EditAvatarPopup>
      <br />
      <br />
      <EditUserInformation id={user.id} />
      <Divider horizontal section>
        <Header as="h4">
          {t('common.language', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <Dropdown
        fluid
        selection
        options={[
          {
            value: 'auto',
            text: t('common.detectAutomatically'),
          },
          ...locales.map((locale) => ({
            value: locale.language,
            flag: locale.country,
            text: locale.name,
          })),
        ]}
        value={user.language || 'auto'}
        onChange={handleLanguageChange}
      />
      {(isUsernameEditable || isEmailEditable || isPasswordEditable) && (
        <>
          <Divider horizontal section>
            <Header as="h4">
              {t('common.authentication', {
                context: 'title',
              })}
            </Header>
          </Divider>
          {isUsernameEditable && (
            <div className={styles.action}>
              <EditUserUsernamePopup id={user.id} withPasswordConfirmation={!user.isSsoUser}>
                <Button className={styles.actionButton}>
                  {t('action.editUsername', {
                    context: 'title',
                  })}
                </Button>
              </EditUserUsernamePopup>
            </div>
          )}
          {isEmailEditable && (
            <div className={styles.action}>
              <EditUserEmailPopup id={user.id} withPasswordConfirmation={!user.isSsoUser}>
                <Button className={styles.actionButton}>
                  {t('action.editEmail', {
                    context: 'title',
                  })}
                </Button>
              </EditUserEmailPopup>
            </div>
          )}
          {isPasswordEditable && (
            <div className={styles.action}>
              <EditUserPasswordPopup id={user.id} withPasswordConfirmation={!user.isSsoUser}>
                <Button className={styles.actionButton}>
                  {t('action.editPassword', {
                    context: 'title',
                  })}
                </Button>
              </EditUserPasswordPopup>
            </div>
          )}
        </>
      )}
    </Tab.Pane>
  );
});

export default AccountPane;
