import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Tab } from 'semantic-ui-react';

import InformationEdit from './InformationEdit';
import DeletePopup from '../../DeletePopup';

import styles from './GeneralPane.module.scss';

const GeneralPane = React.memo(({ name, onUpdate, onDelete }) => {
  const [t] = useTranslation();

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
          title={t('common.deleteProject', {
            context: 'title',
          })}
          content={t('common.areYouSureYouWantToDeleteThisProject')}
          buttonContent={t('action.deleteProject')}
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
