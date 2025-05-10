/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import InputMask from 'react-input-mask';

export default class MaskedInput extends InputMask {
  focus(options) {
    this.getInputDOMNode().focus(options);
  }

  select() {
    this.getInputDOMNode().select();
  }
}
