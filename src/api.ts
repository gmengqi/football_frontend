import axios from 'axios';

// Set the base URL of your backend API
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,  // Spring Boot backend
});

export default api;
