/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dropdown, Menu } from 'semantic-ui-react';
import { Input, Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import { useField, useNestedRef } from '../../../hooks';
import { CardRelationKinds } from '../../../constants/Enums';

import styles from './LinkCardStep.module.scss';

const KIND_OPTIONS = [
  {
    key: CardRelationKinds.RELATED,
    value: CardRelationKinds.RELATED,
  },
  {
    key: CardRelationKinds.PARENT,
    value: CardRelationKinds.PARENT,
  },
  {
    key: CardRelationKinds.CHILD,
    value: CardRelationKinds.CHILD,
  },
  {
    key: CardRelationKinds.BLOCKS,
    value: CardRelationKinds.BLOCKS,
  },
  {
    key: CardRelationKinds.BLOCKEDBY,
    value: CardRelationKinds.BLOCKEDBY,
  },
  {
    key: CardRelationKinds.DUPLICATE,
    value: CardRelationKinds.DUPLICATE,
  },
];

const LinkCardStep = React.memo(({ onSelect, onBack }) => {
  const [t] = useTranslation();
  const [search, handleSearchChange] = useField('');
  const [kind, setKind] = useState(CardRelationKinds.RELATED);
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const cards = useSelector((state) =>
    selectors.selectCardsExceptCurrentAndRelatedForCurrentBoard(state, kind),
  );

  const filteredCards = useMemo(
    () =>
      cards?.filter((card) => (card.name || '').toLowerCase().includes(cleanSearch)).slice(0, 100),
    [cards, cleanSearch],
  );

  const kindOptions = useMemo(
    () =>
      KIND_OPTIONS.map((option) => ({
        ...option,
        text: t(`common.${option.value}`, {
          defaultValue: option.value[0].toUpperCase() + option.value.slice(1),
        }),
      })),
    [t],
  );

  const [searchFieldRef, handleSearchFieldRef] = useNestedRef('inputRef');

  const handleKindChange = useCallback((event, { value }) => {
    setKind(value);
  }, []);

  const handleCardClick = useCallback(
    (cardId) => {
      onSelect(cardId, kind);
    },
    [onSelect, kind],
  );

  useEffect(() => {
    searchFieldRef.current.focus({
      preventScroll: true,
    });
  }, [searchFieldRef]);

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.linkToCard', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Dropdown
          fluid
          selection
          options={kindOptions}
          value={kind}
          className={styles.kind}
          onChange={handleKindChange}
        />
        <Input
          fluid
          ref={handleSearchFieldRef}
          value={search}
          placeholder={t('common.searchCards')}
          maxLength={1024}
          icon="search"
          onChange={handleSearchChange}
        />
        {filteredCards?.length > 0 && (
          <Menu secondary vertical className={styles.menu}>
            {filteredCards?.map((card) => (
              <Menu.Item
                key={card.id}
                // disabled={!card.isPersisted}
                onClick={() => handleCardClick(card.id)}
              >
                <span className={styles.name}>{card.name}</span>
              </Menu.Item>
            ))}
          </Menu>
        )}
      </Popup.Content>
    </>
  );
});

LinkCardStep.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

LinkCardStep.defaultProps = {
  onBack: undefined,
};

export default LinkCardStep;
