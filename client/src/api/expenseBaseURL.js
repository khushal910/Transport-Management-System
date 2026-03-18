import axios from "axios";

const expenseBaseURL = axios.create({
  baseURL: "http://localhost:3000/api/expense",
  withCredentials: true,
});

export default expenseBaseURL;
