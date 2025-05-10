/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Icon, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { usePopupInClosableContext } from '../../../hooks';
import BaseCustomFieldGroupChip from '../../base-custom-field-groups/BaseCustomFieldGroupChip';
import BaseCustomFieldGroupStep from '../../base-custom-field-groups/BaseCustomFieldGroupStep';
import AddBaseCustomFieldGroupStep from '../../base-custom-field-groups/AddBaseCustomFieldGroupStep';

import styles from './BaseCustomFieldGroupsPane.module.scss';

const BaseCustomFieldGroupsPane = React.memo(() => {
  const baseCustomFieldGroupIds = useSelector(
    selectors.selectBaseCustomFieldGroupIdsForCurrentProject,
  );

  const BaseCustomFieldGroupPopup = usePopupInClosableContext(BaseCustomFieldGroupStep);
  const AddBaseCustomFieldGroupPopup = usePopupInClosableContext(AddBaseCustomFieldGroupStep);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <div className={styles.attachments}>
        {baseCustomFieldGroupIds.map((baseCustomFieldGroupId) => (
          <span key={baseCustomFieldGroupId} className={styles.attachment}>
            <BaseCustomFieldGroupPopup id={baseCustomFieldGroupId}>
              <BaseCustomFieldGroupChip id={baseCustomFieldGroupId} />
            </BaseCustomFieldGroupPopup>
          </span>
        ))}
        <AddBaseCustomFieldGroupPopup>
          <button
            type="button"
            className={classNames(styles.attachment, styles.addAttachmentButton)}
          >
            <Icon name="plus" size="small" className={styles.addAttachmentButtonIcon} />
          </button>
        </AddBaseCustomFieldGroupPopup>
      </div>
    </Tab.Pane>
  );
});

export default BaseCustomFieldGroupsPane;
