import axios from 'axios';

const driverStatusBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/driver-status',
  withCredentials: true,
});

export default driverStatusBaseURL;
