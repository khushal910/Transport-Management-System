import axios from "axios";

const tripBaseURL = axios.create({
  baseURL: "http://localhost:3000/api/trip",
  withCredentials: true,
});

export default tripBaseURL;
