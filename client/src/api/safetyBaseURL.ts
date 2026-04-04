import axios from 'axios';

const safetyBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/safety',
  withCredentials: true,
});

export default safetyBaseURL;
