import { useCallback } from 'react';

import useDeepCompareMemoize from './use-deep-compare-memoize';

// eslint-disable-next-line max-len
export default (callback, dependencies) => useCallback(callback, useDeepCompareMemoize(dependencies));
