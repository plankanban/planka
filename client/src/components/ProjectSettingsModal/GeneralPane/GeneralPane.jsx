import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import InformationEdit from './InformationEdit';
import DeleteStep from '../../DeleteStep';

import styles from './GeneralPane.module.scss';

const GeneralPane = React.memo(({ name, onUpdate, onDelete }) => {
  const [t] = useTranslation();

  const DeletePopup = usePopup(DeleteStep);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <InformationEdit
        defaultData={{
          name,
        }}
        onUpdate={onUpdate}
      />
      <Divider horizontal section>
        <Header as="h4">
          {t('common.dangerZone', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <div className={styles.action}>
        <DeletePopup
          title="common.deleteProject"
          content="common.areYouSureYouWantToDeleteThisProject"
          buttonContent="action.deleteProject"
          onConfirm={onDelete}
        >
          <Button className={styles.actionButton}>
            {t('action.deleteProject', {
              context: 'title',
            })}
          </Button>
        </DeletePopup>
      </div>
    </Tab.Pane>
  );
});

GeneralPane.propTypes = {
  name: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default GeneralPane;
