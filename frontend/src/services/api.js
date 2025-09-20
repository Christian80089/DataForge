import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // indirizzo del backend
});

export default api;
