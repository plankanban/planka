import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {Button, Menu} from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import styles from './SortStep.module.scss';

const SortStep = React.memo(({ title, onSort, onBack }) => {
  const [t] = useTranslation();

  const handeClick = (sortType) => onSort({sortType})

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
          <Menu secondary vertical className={styles.menu}>
              <Menu.Item className={styles.menuItem} onClick={() => handeClick('createdat_asc')}>
                  {t('action.sort.createdFirst', {
                      context: 'title',
                  })}
              </Menu.Item>
              <Menu.Item className={styles.menuItem} onClick={() => handeClick('createdat_desc')}>
                  {t('action.sort.createdLast', {
                      context: 'title',
                  })}
              </Menu.Item>
              <Menu.Item className={styles.menuItem} onClick={() => handeClick('name_asc')}>
                  {t('action.sort.name', {
                      context: 'title',
                  })}
              </Menu.Item>
              <Menu.Item className={styles.menuItem} onClick={() => handeClick('duedate_asc')}>
                  {t('action.sort.due', {
                      context: 'title',
                  })}
              </Menu.Item>
          </Menu>
      </Popup.Content>
    </>
  );
});

SortStep.propTypes = {
  title: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

SortStep.defaultProps = {
  onBack: undefined,
};

export default SortStep;
