const API_BASE = 'http://localhost:1337/api';

const client = {
  post: async (url, data, headers = {}) => {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
    const response = await fetch(isAbsolute ? url : `${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default client;
