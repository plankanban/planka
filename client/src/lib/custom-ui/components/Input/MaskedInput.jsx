import InputMask from 'react-input-mask';

export default class MaskedInput extends InputMask {
  focus() {
    this.getInputDOMNode().focus();
  }

  select() {
    this.getInputDOMNode().select();
  }
}
