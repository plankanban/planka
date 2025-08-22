/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import { Toaster as HotToaster, ToastBar as HotToastBar } from 'react-hot-toast';

import ToastTypes from '../../../constants/ToastTypes';
import FileIsTooBig from './FileIsTooBig';
import NotEnoughStorage from './NotEnoughStorage';
import EmptyTrashToast from './EmptyTrashToast';

const TOAST_BY_TYPE = {
  [ToastTypes.FILE_IS_TOO_BIG]: FileIsTooBig,
  [ToastTypes.NOT_ENOUGH_STORAGE]: NotEnoughStorage,
  [ToastTypes.EMPTY_TRASH]: EmptyTrashToast,
};

const Toaster = React.memo(() => (
  <HotToaster>
    {(toast) => (
      <HotToastBar
        toast={toast}
        style={{
          background: 'transparent',
          borderRadius: 0,
          maxWidth: '90%',
          padding: 0,
        }}
      >
        {() => {
          const Toast = TOAST_BY_TYPE[toast.message.type];

          // eslint-disable-next-line react/jsx-props-no-spreading
          return <Toast {...toast.message.params} id={toast.id} />;
        }}
      </HotToastBar>
    )}
  </HotToaster>
));

export default Toaster;
