import { Model } from 'redux-orm';

export default class BaseModel extends Model {
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _onDelete() {}
}
