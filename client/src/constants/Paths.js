import Config from './Config';

const ROOT = `${Config.BASE_PATH}/`;
const LOGIN = `${Config.BASE_PATH}/login`;
const OIDC_LOGIN = `${Config.BASE_PATH}/oidclogin`;
const PROJECTS = `${Config.BASE_PATH}/projects/:id`;
const BOARDS = `${Config.BASE_PATH}/boards/:id`;
const CARDS = `${Config.BASE_PATH}/cards/:id`;

export default {
  ROOT,
  LOGIN,
  PROJECTS,
  BOARDS,
  CARDS,
  OIDC_LOGIN,
};
