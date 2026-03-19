import axios from 'axios';

const analyticsBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/analytics',
  withCredentials: true,
});

export default analyticsBaseURL;
