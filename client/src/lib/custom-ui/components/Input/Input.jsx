import { Input as SemanticUIInput } from 'semantic-ui-react';

import InputPassword from './InputPassword';
import InputMask from './InputMask';

const Input = SemanticUIInput;

Input.Password = InputPassword;
Input.Mask = InputMask;

export default Input;
