import axios from "axios";

const vehicleBaseURL = axios.create({
  baseURL: 'http://localhost:3000/api/vehicle',
  withCredentials: true, 
})

export default vehicleBaseURL;
