import axios from 'axios';

// Set the base URL of your backend API
const api = axios.create({
    baseURL: 'http://localhost:8080/api',  // Spring Boot backend
});

export default api;
