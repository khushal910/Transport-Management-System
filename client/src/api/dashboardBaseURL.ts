import axios from 'axios';

const dashboardBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/dashboard',
  withCredentials: true,
});

export default dashboardBaseURL;
