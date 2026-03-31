import axios from 'axios';

const authBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true, // Include cookies for authentication
})

export default authBaseURL;