/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';

import useClosable from './use-closable';
import { ClosableContext } from '../contexts';

export default (initialClosableValue) => {
  const [isClosableActiveRef, activateClosable, deactivateClosable, setIsClosableActive] =
    useClosable(initialClosableValue);

  const closableContextValue = useMemo(
    () => [activateClosable, deactivateClosable, setIsClosableActive],
    [activateClosable, deactivateClosable, setIsClosableActive],
  );

  const ClosableModal = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const ClosableModal = React.memo(({ closeIcon, onClose, ...props }) => {
      const handleClose = useCallback(
        (event) => {
          if (isClosableActiveRef.current) {
            if (closeIcon && event.type === 'click') {
              if (!event.currentTarget.classList.contains('close')) {
                return;
              }
            } else {
              return;
            }
          }

          if (onClose) {
            onClose();
          }
        },
        [closeIcon, onClose],
      );

      return (
        <ClosableContext.Provider value={closableContextValue}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Modal open {...props} closeIcon={closeIcon} onClose={handleClose} />
        </ClosableContext.Provider>
      );
    });

    ClosableModal.propTypes = {
      closeIcon: PropTypes.bool,
      onClose: PropTypes.func,
    };

    ClosableModal.defaultProps = {
      closeIcon: undefined,
      onClose: undefined,
    };

    ClosableModal.Header = Modal.Header;
    ClosableModal.Content = Modal.Content;
    ClosableModal.Actions = Modal.Actions;

    return ClosableModal;
  }, [isClosableActiveRef, closableContextValue]);

  return [
    ClosableModal,
    isClosableActiveRef,
    activateClosable,
    deactivateClosable,
    setIsClosableActive,
  ];
};
