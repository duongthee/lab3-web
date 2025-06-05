/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 */
async function fetchModel(url) {
  try {
    // Get the user data from localStorage
    const userData = localStorage.getItem('user');
    const headers = {};
    
    // If user data exists, add the authentication token to headers
    if (userData) {
      const user = JSON.parse(userData);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }

    const response = await fetch(url, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching model:', error);
    throw error;
  }
}

export default fetchModel;
