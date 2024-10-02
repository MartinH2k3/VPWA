import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3333', withCredentials: true });


// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    // If the response is successful, just return the response
    return response;
  },
  function (error) {
    const { status, data } = error.response;

    if (status === 401 && typeof data === 'string' && data.includes('Redirecting')) {
      window.location.href = data.match(/Redirecting to (.*)/)?.[1]?.trim() || '/';
    }

    // Reject the promise to allow further error handling
    return Promise.reject(error);
  }
);
export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
});

export { api };
