/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { Button, Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { BoardMembershipRoles } from '../../../constants/Enums';
import Card from '../../cards/Card';
import AddCard from '../../cards/AddCard';
import PlusMathIcon from '../../../assets/images/plus-math-icon.svg?react';

import styles from './ListView.module.scss';

const ListView = React.memo(
  ({ cardIds, isCardsFetching, isAllCardsFetched, onCardsFetch, onCardCreate }) => {
    const canAddCard = useSelector((state) => {
      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
    });

    const [t] = useTranslation();
    const [isAddCardOpened, setIsAddCardOpened] = useState(false);

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

    return (
      <div className={styles.wrapper}>
        {canAddCard &&
          (onCardCreate && isAddCardOpened ? (
            <div className={styles.segment}>
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
        {cardIds.length > 0 && (
          <div className={classNames(styles.segment, styles.cards)}>
            {cardIds.map((cardId, cardIndex) => (
              <div key={cardId} className={styles.card}>
                <Card isInline id={cardId} index={cardIndex} />
              </div>
            ))}
          </div>
        )}
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

ListView.propTypes = {
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardsFetching: PropTypes.bool,
  isAllCardsFetched: PropTypes.bool,
  onCardsFetch: PropTypes.func,
  onCardCreate: PropTypes.func,
};

ListView.defaultProps = {
  isCardsFetching: undefined,
  isAllCardsFetched: undefined,
  onCardsFetch: undefined,
  onCardCreate: undefined,
};

export default ListView;
