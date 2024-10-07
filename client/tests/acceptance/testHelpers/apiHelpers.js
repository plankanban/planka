const axios = require('axios');

async function getXauthToken() {
  try {
    const res = await axios.post(
      'http://localhost:1337/api/access-tokens',
      {
        emailOrUsername: 'demo',
        password: 'demo',
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
    const res = await axios.get('http://localhost:1337/api/projects', {
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
        await axios.delete(`http://localhost:1337/api/projects/${project}`, {
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
