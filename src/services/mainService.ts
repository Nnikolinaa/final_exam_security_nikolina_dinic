import axios, { AxiosError, type AxiosResponse } from "axios";
import { AuthService } from "./authService";

const client = axios.create({
  baseURL: 'https://localhost:3003', // Ensure this matches your backend URL
  headers: {
    'Accept': 'application/json',
  },
  validateStatus: (status: number) => {
    return status >= 200 && status < 300; // Accept only 2xx status codes as valid responses
  },
});

export class MainService {
  static async login(email: string, password: string) {
    return await client.request({
      url: '/api/user/login', // Explicitly include `/api` in the path
      method: 'post',
      data: {
        email: email,
        password: password,
      },
    });
  }

  static async useAxios<T>(
    url: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    data: any = {}
  ): Promise<AxiosResponse<T, any>> {
    let rsp: AxiosResponse;

    try {
      const headers =
        url === '/user/register' || url === '/user/login' // Exclude Authorization for public routes
          ? {}
          : {
              'Authorization': `Bearer ${AuthService.getAccessToken()}`,
            };

      rsp = await client.request<T>({
        url: `/api${url}`, // Prepend `/api` to all paths
        method: method,
        headers: headers,
        data: data,
      }) as AxiosResponse;
    } catch (e) {
      rsp = (e as AxiosError).response as AxiosResponse;
    }

    if (rsp == undefined) {
      throw new Error('BACKEND_UNREACHABLE');
    }

    if (rsp.status == 403) {
      console.warn('Access token expired. Attempting to refresh...');

      try {
        const refreshToken = AuthService.getRefreshToken();

        const tokenRequest = await client.request({
          url: '/api/user/refresh',
          method: 'post',
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
          },
        });

        AuthService.createAuth(tokenRequest.data);

        // Retry the original request with the new access token
        rsp = await client.request<T>({
          url: `/api${url}`,
          method: method,
          headers: {
            'Authorization': `Bearer ${AuthService.getAccessToken()}`,
          },
          data: data,
        });
      } catch (e) {
        console.error('Failed to refresh token:', (e as Error).message);
        AuthService.removeAuth();
        throw new Error('REFRESH_FAILED');
      }
    }

    if (rsp.status == 404) {
      throw new Error('NOT_FOUND');
    }

    return rsp;
  }
}