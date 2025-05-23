/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { Model } from 'redux-orm';

export default class BaseModel extends Model {
  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _onDelete() {}
}
