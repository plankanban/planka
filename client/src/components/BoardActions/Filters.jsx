import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonGroup, Icon } from 'semantic-ui-react';
import { usePopup } from '../../lib/popup';

import FiltersStep from '../FiltersStep';

import styles from './Filters.module.scss';

const Filters = React.memo(
  ({
    keyword,
    users,
    labels,
    allBoardMemberships,
    allLabels,
    canEdit,
    onKeywordUpdate,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelMove,
    onLabelDelete,
  }) => {
    const [t] = useTranslation();

    const isFiltering = useMemo(
      () => !!(keyword || users.length || labels.length),
      [keyword, users, labels],
    );

    const handleClickClear = useCallback(() => {
      onKeywordUpdate('');
      users.forEach((user) => onUserRemove(user.id));
      labels.forEach((label) => onLabelRemove(label.id));
    }, [users, labels, onKeywordUpdate, onUserRemove, onLabelRemove]);

    const FiltersPopup = usePopup(FiltersStep);

    return (
      <span className={styles.filter}>
        <ButtonGroup>
          <FiltersPopup
            keyword={keyword}
            users={users}
            labels={labels}
            allBoardMemberships={allBoardMemberships}
            allLabels={allLabels}
            canEdit={canEdit}
            onKeywordUpdate={onKeywordUpdate}
            onUserAdd={onUserAdd}
            onUserRemove={onUserRemove}
            onLabelAdd={onLabelAdd}
            onLabelRemove={onLabelRemove}
            onLabelCreate={onLabelCreate}
            onLabelUpdate={onLabelUpdate}
            onLabelMove={onLabelMove}
            onLabelDelete={onLabelDelete}
          >
            <Button icon labelPosition="left">
              <Icon name="filter" />
              {t('common.filters')}
            </Button>
          </FiltersPopup>
          {isFiltering && <Button onClick={handleClickClear}>{t('common.clear')}</Button>}
        </ButtonGroup>
      </span>
    );
  },
);

Filters.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  keyword: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onKeywordUpdate: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelMove: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default Filters;
