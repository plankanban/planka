import InputMask from 'react-input-mask';

export default class MaskedInput extends InputMask {
  focus(options) {
    this.getInputDOMNode().focus(options);
  }

  select() {
    this.getInputDOMNode().select();
  }
}
