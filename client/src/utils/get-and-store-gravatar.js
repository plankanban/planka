/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import md5 from 'blueimp-md5';

export async function getAndStoreGravatar(email, size = 200) {
  const hash = md5(email.trim().toLowerCase());
  const url = `https://www.gravatar.com/avatar/${hash}?s=${size}`;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        localStorage.setItem(`user_gravatar`, reader.result);
        resolve(url);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return url;
  }
}

export function loadStoredGravatar() {
  return localStorage.getItem('user_gravatar');
}

export function hasStoredGravatar() {
  return localStorage.getItem('user_gravatar') !== null;
}
