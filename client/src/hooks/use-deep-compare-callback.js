import { useCallback } from 'react';

import useDeepCompareMemoize from './use-deep-compare-memoize';

export default (callback, dependencies) => useCallback(
  callback,
  useDeepCompareMemoize(dependencies),
);
