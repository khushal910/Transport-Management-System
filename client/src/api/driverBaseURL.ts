import axios from 'axios';

const driverBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/driver',
  withCredentials: true,
});

export default driverBaseURL;
