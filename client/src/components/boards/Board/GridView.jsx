/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { Button, Loader } from 'semantic-ui-react';
import { useWindowWidth } from '../../../lib/hooks';
import { Masonry } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import { BoardMembershipRoles } from '../../../constants/Enums';
import Card from '../../cards/Card';
import AddCard from '../../cards/AddCard';
import PlusMathIcon from '../../../assets/images/plus-math-icon.svg?react';

import styles from './GridView.module.scss';

const GridView = React.memo(
  ({ cardIds, isCardsFetching, isAllCardsFetched, onCardsFetch, onCardCreate }) => {
    const canAddCard = useSelector((state) => {
      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
    });

    const [t] = useTranslation();
    const [isAddCardOpened, setIsAddCardOpened] = useState(false);
    const windowWidth = useWindowWidth();

    const [inViewRef] = useInView({
      threshold: 1,
      onChange: (inView) => {
        if (inView && onCardsFetch) {
          onCardsFetch();
        }
      },
    });

    const handleAddCardClick = useCallback(() => {
      setIsAddCardOpened(true);
    }, []);

    const handleAddCardClose = useCallback(() => {
      setIsAddCardOpened(false);
    }, []);

    const columns = Math.floor(windowWidth / 300); // TODO: move to constant?

    return (
      <div className={styles.wrapper}>
        <Masonry columns={columns} spacing={20}>
          {canAddCard &&
            (onCardCreate && isAddCardOpened ? (
              <div className={styles.card}>
                <AddCard onCreate={onCardCreate} onClose={handleAddCardClose} />
              </div>
            ) : (
              <Button
                type="button"
                disabled={!onCardCreate}
                className={styles.addCardButton}
                onClick={handleAddCardClick}
              >
                <PlusMathIcon className={styles.addCardButtonIcon} />
                <span className={styles.addCardButtonText}>
                  {onCardCreate ? t('action.addCard') : t('common.atLeastOneListMustBePresent')}
                </span>
              </Button>
            ))}
          {cardIds.map((cardId) => (
            <div key={cardId} className={styles.card}>
              <Card id={cardId} />
            </div>
          ))}
        </Masonry>
        {isCardsFetching !== undefined && isAllCardsFetched !== undefined && (
          <div className={styles.loaderWrapper}>
            {isCardsFetching ? (
              <Loader active inverted inline="centered" size="small" />
            ) : (
              !isAllCardsFetched && <div ref={inViewRef} />
            )}
          </div>
        )}
      </div>
    );
  },
);

GridView.propTypes = {
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardsFetching: PropTypes.bool,
  isAllCardsFetched: PropTypes.bool,
  onCardsFetch: PropTypes.func,
  onCardCreate: PropTypes.func,
};

GridView.defaultProps = {
  isCardsFetching: undefined,
  isAllCardsFetched: undefined,
  onCardsFetch: undefined,
  onCardCreate: undefined,
};

export default GridView;
