import { Mutex } from "async-mutex";
import axiosClient from "axios";
import {message, notification} from "antd";

/**
 * Creates an initial 'axios' instance with custom settings.
 */

const instance = axiosClient.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';

const handleRefreshToken = async () => {
    return await mutex.runExclusive(async () => {
        const res = await instance.get('/api/v1/auth/refresh');
        if (res && res.data) return res.data.access_token;
        else return null;
    });
};

instance.interceptors.request.use(function (config) {
    const accessToken = window?.localStorage?.getItem('access_token');
    // Không thêm Bearer token cho các endpoint /login và /refresh
    if (accessToken && config.url !== '/api/v1/auth/login' && config.url !== '/api/v1/auth/refresh' && config.url !== '/api/v1/auth/forgot') {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (!config.headers.Accept && config.headers["Content-Type"]) {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json; charset=utf-8";
    }

    return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
    (res) => res.data,
    async (error) => {
        if (error.config && error.response
            && +error.response.status === 401
            && error.config.url !== '/api/v1/auth/login'
            && error.config.url !== '/api/v1/auth/refresh'
            && !error.config.headers[NO_RETRY_HEADER]
        ) {
            const access_token = await handleRefreshToken();
            error.config.headers[NO_RETRY_HEADER] = 'true';
            if (access_token) {
                error.config.headers['Authorization'] = `Bearer ${access_token}`;
                localStorage.setItem('access_token', access_token);
                return instance.request(error.config);
            }
        }

        if (
            error.config && error.response
            && +error.response.status === 400
            && error.config.url === '/api/v1/auth/refresh'
            && location.pathname.startsWith("/admin")
        ) {
            const message = error?.response?.data?.error ?? "Có lỗi xảy ra, vui lòng login.";
            //dispatch redux action
        }

        if (+error.response.status === 403) {
            console.log(error)
            message.info(error?.response?.data?.message ?? "");
            // notification.error({
            //     message: error?.response?.data?.message ?? "",
            //     description: error?.response?.data?.error ?? ""
            // });
        }

        return error?.response?.data ?? Promise.reject(error);
    }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = (cfg) => instance.request(cfg);

// export default axios;

export default instance;