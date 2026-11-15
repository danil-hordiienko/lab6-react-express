import axios from 'axios'

// Read and Create use the same Express server.
// Keep the port here so a URL change only needs one edit.
export const movieApi = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
})
