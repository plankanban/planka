import { useEffect } from 'react';

import useDeepCompareMemoize from './use-deep-compare-memoize';

export default (effect, dependencies) => {
  useEffect(effect, useDeepCompareMemoize(dependencies));
};
