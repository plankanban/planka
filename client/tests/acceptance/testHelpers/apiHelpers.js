const axios = require('axios');
const config = require('../config');

async function getXauthToken() {
  try {
    const res = await axios.post(
      `${config.baseUrl}api/access-tokens`,
      {
        emailOrUsername: config.adminUser.email,
        password: config.adminUser.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return res.data.item;
  } catch (error) {
    return `Error requesting access token: ${error.message}`;
  }
}

async function getProjectIDs() {
  try {
    const res = await axios.get(`${config.baseUrl}api/projects`, {
      headers: {
        Authorization: `Bearer ${await getXauthToken()}`,
      },
    });
    return res.data.items.map((project) => project.id);
  } catch (error) {
    return `Error requesting projectIDs: ${error.message}`;
  }
}

async function deleteProject() {
  try {
    const projectIDs = await getProjectIDs();
    await Promise.all(
      projectIDs.map(async (project) => {
        await axios.delete(`${config.baseUrl}api/projects/${project}`, {
          headers: {
            Authorization: `Bearer ${await getXauthToken()}`,
          },
        });
      }),
    );
    return true;
  } catch (error) {
    return `Error deleting project: ${error.message}`;
  }
}

module.exports = {
  deleteProject,
};
