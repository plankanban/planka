import React, { useState, useCallback } from 'react';
import { ControlledMenu, useMenuState } from '@szhsin/react-menu';
import { Menu } from 'semantic-ui-react';
import { Popup } from '../custom-ui';

import '@szhsin/react-menu/dist/index.css';

/**
 * hooks for popup menu
 *
 * @param {string} title Title of the popup
 * @param {{
 *  title: string,
 *  onClick: () => void,
 * }[]} list Menu list to shown
 */
export default function usePopupMenu(title, list) {
  const [menuProps, toggleMenu] = useMenuState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [customElement, setElement] = useState(null);

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      setAnchorPoint({ x: e.clientX, y: e.clientY });
      toggleMenu(true);
    },
    [toggleMenu],
  );

  const handleClose = useCallback(() => {
    toggleMenu(false);
    setElement(null);
  }, [toggleMenu]);

  const element = (
    <ControlledMenu
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...menuProps}
      anchorPoint={anchorPoint}
      direction="right"
      onClose={handleClose}
    >
      {customElement || (
        <>
          <Popup.Header>{title}</Popup.Header>

          <Popup.Content>
            <Menu secondary vertical>
              {list.map(({ title: itemTitle, onClick }) => (
                <Menu.Item key={itemTitle} onClick={onClick}>
                  {itemTitle}
                </Menu.Item>
              ))}
            </Menu>
          </Popup.Content>
        </>
      )}
    </ControlledMenu>
  );

  return {
    handleContextMenu,
    toggleMenu,
    element,
    setElement,
  };
}
