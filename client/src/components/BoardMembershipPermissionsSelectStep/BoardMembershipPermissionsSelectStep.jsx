import { dequal } from 'dequal';
import omit from 'lodash/omit';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Menu, Radio, Segment } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import { BoardMembershipRoles } from '../../constants/Enums';

import styles from './BoardMembershipPermissionsSelectStep.module.scss';

const BoardMembershipPermissionsSelectStep = React.memo(
  ({ defaultData, title, buttonContent, onSelect, onBack, onClose }) => {
    const [t] = useTranslation();

    const [data, setData] = useState(() => ({
      role: BoardMembershipRoles.EDITOR,
      canComment: null,
      ...defaultData,
    }));

    const handleSelectRoleClick = useCallback((role) => {
      setData((prevData) => ({
        ...prevData,
        role,
        canComment: role === BoardMembershipRoles.VIEWER ? !!prevData.canComment : null,
      }));
    }, []);

    const handleSettingChange = useCallback((_, { name: fieldName, checked: value }) => {
      setData((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }, []);

    const handleSubmit = useCallback(() => {
      if (!dequal(data, defaultData)) {
        onSelect(data.role === BoardMembershipRoles.VIEWER ? data : omit(data, 'canComment'));
      }

      onClose();
    }, [defaultData, onSelect, onClose, data]);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <Menu secondary vertical className={styles.menu}>
              <Menu.Item
                active={data.role === BoardMembershipRoles.EDITOR}
                onClick={() => handleSelectRoleClick(BoardMembershipRoles.EDITOR)}
              >
                <div className={styles.menuItemTitle}>{t('common.editor')}</div>
                <div className={styles.menuItemDescription}>
                  {t('common.canEditContentOfBoard')}
                </div>
              </Menu.Item>
              <Menu.Item
                active={data.role === BoardMembershipRoles.VIEWER}
                onClick={() => handleSelectRoleClick(BoardMembershipRoles.VIEWER)}
              >
                <div className={styles.menuItemTitle}>{t('common.viewer')}</div>
                <div className={styles.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
              </Menu.Item>
            </Menu>
            {data.role === BoardMembershipRoles.VIEWER && (
              <Segment basic className={styles.settings}>
                <Radio
                  toggle
                  name="canComment"
                  checked={data.canComment}
                  label={t('common.canComment')}
                  onChange={handleSettingChange}
                />
              </Segment>
            )}
            <Button positive content={t(buttonContent)} />
          </Form>
        </Popup.Content>
      </>
    );
  },
);

BoardMembershipPermissionsSelectStep.propTypes = {
  defaultData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

BoardMembershipPermissionsSelectStep.defaultProps = {
  defaultData: undefined,
  title: 'common.selectPermissions',
  buttonContent: 'action.selectPermissions',
};

export default BoardMembershipPermissionsSelectStep;
