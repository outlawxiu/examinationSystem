import { message } from "antd";
import axios from "axios";

const request = axios.create({
  timeout: 5000,
  baseURL: "/api",
});

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    config.headers.Authorization = localStorage.getItem("token");
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.status === 401) {
      message.error(error.response.data)
      localStorage.removeItem("token")
      location.replace("/login")
      return Promise.reject(error);
    }

  }
);

export default request;
