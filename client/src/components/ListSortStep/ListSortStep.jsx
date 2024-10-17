import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';
import { ListSortTypes } from '../../constants/Enums';

import styles from './ListSortStep.module.scss';

const ListSortStep = React.memo(({ onTypeSelect, onBack }) => {
  const [t] = useTranslation();

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.sortList', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item
            className={styles.menuItem}
            onClick={() => onTypeSelect(ListSortTypes.NAME_ASC)}
          >
            {t('common.title')}
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            onClick={() => onTypeSelect(ListSortTypes.DUE_DATE_ASC)}
          >
            {t('common.dueDate')}
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            onClick={() => onTypeSelect(ListSortTypes.CREATED_AT_ASC)}
          >
            {t('common.oldestFirst')}
          </Menu.Item>
          <Menu.Item
            className={styles.menuItem}
            onClick={() => onTypeSelect(ListSortTypes.CREATED_AT_DESC)}
          >
            {t('common.newestFirst')}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
});

ListSortStep.propTypes = {
  onTypeSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

ListSortStep.defaultProps = {
  onBack: undefined,
};

export default ListSortStep;
