import { matchPath } from 'react-router-dom';

export default (pathname, paths) => {
  for (let i = 0; i < paths.length; i += 1) {
    const match = matchPath(
      {
        path: paths[i],
        end: true,
      },
      pathname,
    );

    if (match) {
      return match;
    }
  }

  return null;
};
