import axios from 'axios';

import config from '@/config';

const instance = axios.create({
  baseURL: config.baseURL,
});

// 添加请求拦截器
instance.interceptors.request.use(
  async function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default instance;
