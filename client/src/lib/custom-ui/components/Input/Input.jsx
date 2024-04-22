import { Input as SemanticUIInput } from 'semantic-ui-react';

import InputPassword from './InputPassword';
import InputMask from './InputMask';

export default class Input extends SemanticUIInput {
  static Password = InputPassword;

  static Mask = InputMask;

  focus = (options) => this.inputRef.current.focus(options);

  blur = () => this.inputRef.current.blur();
}
