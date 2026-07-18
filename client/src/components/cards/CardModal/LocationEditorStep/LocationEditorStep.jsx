/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, Icon, Loader } from "semantic-ui-react";
import { Input, Popup } from "../../../../lib/custom-ui";

import selectors from "../../../../selectors";
import entryActions from "../../../../entry-actions";
import { useNestedRef } from "../../../../hooks";

import styles from "./LocationEditorStep.module.scss";

const DEBOUNCE_DELAY = 300;

const LocationEditorStep = React.memo(({ onClose }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const card = useSelector(selectors.selectCurrentCard);
  const locationSearch = useSelector(selectors.selectLocationSearch);

  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState(
    card.location ? card.location.placeName : "",
  );
  const [selectedLocation, setSelectedLocation] = useState(null);

  const debounceTimerRef = useRef(null);
  const [searchFieldRef, handleSearchFieldRef] = useNestedRef("inputRef");

  const handleSearchChange = useCallback(
    (_, { value }) => {
      setSearchQuery(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (value.trim().length < 3) {
        dispatch(entryActions.clearLocationSearch());
        return;
      }

      debounceTimerRef.current = setTimeout(() => {
        dispatch(entryActions.searchLocations(card.id, value));
      }, DEBOUNCE_DELAY);
    },
    [card.id, dispatch],
  );

  const handleTitleChange = useCallback((_, { value }) => {
    setTitle(value);
  }, []);

  const handleResultSelect = useCallback(
    (result) => {
      setSelectedLocation(result);
      setTitle(result.placeName);
      setSearchQuery("");
      dispatch(entryActions.clearLocationSearch());
    },
    [dispatch],
  );

  const handleSave = useCallback(() => {
    if (!selectedLocation && !card.location) {
      return;
    }

    const locationToSave = selectedLocation || card.location;
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    dispatch(
      entryActions.updateCurrentCard({
        location: {
          placeName: trimmedTitle,
          latitude: locationToSave.latitude,
          longitude: locationToSave.longitude,
          formattedAddress: locationToSave.formattedAddress,
        },
      }),
    );

    onClose();
  }, [selectedLocation, card.location, title, dispatch, onClose]);

  const handleRemove = useCallback(() => {
    dispatch(
      entryActions.updateCurrentCard({
        location: null,
      }),
    );

    onClose();
  }, [dispatch, onClose]);

  useEffect(() => {
    if (searchFieldRef.current) {
      searchFieldRef.current.focus({
        preventScroll: true,
      });
    }
  }, [searchFieldRef]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      dispatch(entryActions.clearLocationSearch());
    };
  }, [dispatch]);

  const { results, isSearching, error } = locationSearch;
  const hasResults = results && results.length > 0;
  const hasEmptyResults = results && results.length === 0;
  const showSaveButton = selectedLocation || card.location;

  return (
    <>
      <Popup.Header>{t("common.location")}</Popup.Header>
      <Popup.Content>
        {(selectedLocation || card.location) && (
          <div className={styles.titleSection}>
            <div className={styles.label}>{t("common.locationTitle")}</div>
            <Input
              fluid
              name="title"
              value={title}
              maxLength={256}
              className={styles.field}
              onChange={handleTitleChange}
            />
          </div>
        )}

        <div className={styles.label}>{t("common.searchLocations")}</div>
        <Input
          fluid
          ref={handleSearchFieldRef}
          icon="search"
          value={searchQuery}
          placeholder={t("common.searchLocations")}
          className={styles.field}
          onChange={handleSearchChange}
        />

        {isSearching && (
          <div className={styles.loading}>
            <Loader active inline size="small" />
          </div>
        )}

        {error && (
          <div className={styles.error}>{t("common.locationSearchError")}</div>
        )}

        {hasEmptyResults && !isSearching && (
          <div className={styles.empty}>{t("common.noLocationsFound")}</div>
        )}

        {hasResults && (
          <div className={styles.results}>
            {results.slice(0, 5).map((result, index) => (
              <button
                key={`${result.placeName}-${result.latitude}-${result.longitude}-${index}`} // eslint-disable-line react/no-array-index-key
                type="button"
                className={styles.resultItem}
                onClick={() => handleResultSelect(result)}
              >
                <Icon
                  name="map marker alternate"
                  className={styles.resultIcon}
                />
                <div className={styles.resultContent}>
                  <div className={styles.resultName}>{result.placeName}</div>
                  <div className={styles.resultAddress}>
                    {result.formattedAddress}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {card.location && !selectedLocation && (
          <div className={styles.currentLocation}>
            <div className={styles.currentLocationInfo}>
              <Icon
                name="map marker alternate"
                className={styles.currentLocationIcon}
              />
              <div className={styles.currentLocationText}>
                <div className={styles.currentLocationName}>
                  {card.location.placeName}
                </div>
                <div className={styles.currentLocationAddress}>
                  {card.location.formattedAddress}
                </div>
              </div>
            </div>
            <Button
              size="tiny"
              negative
              content={t("action.removeLocation")}
              className={styles.removeButton}
              onClick={handleRemove}
            />
          </div>
        )}

        {showSaveButton && (
          <Button
            positive
            fluid
            content={t("action.save")}
            className={styles.saveButton}
            onClick={handleSave}
          />
        )}
      </Popup.Content>
    </>
  );
});

LocationEditorStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default LocationEditorStep;
