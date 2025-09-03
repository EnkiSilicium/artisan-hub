/* eslint-disable */
import axios from 'axios';

module.exports = async function () {
  // Global setup already set these envs; just wire axios
  const base = process.env.READ_BASE_URL ?? 'http://127.0.0.1:3002';
  axios.defaults.baseURL = base;
};
