import Axios from 'axios';
import qs from 'qs';

const http = Axios.create({
  baseURL: process.env.VITE_APP_SERVER_PATH,
});

let token = '';
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500
    ) {
      console.log('Logging the error', error);
    }

    throw error;
  }
);

export interface SigninAPIgatewayResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// export interface CemeraResponse {
//   access_token: string;
//   expires_in: number;
//   token_type: string;
//   scope: string;
// }

export async function signinAPIgateway(): Promise<SigninAPIgatewayResponse> {
  return http
    .post<SigninAPIgatewayResponse>(
      `/idp/connect/token`,
      qs.stringify({
        grant_type: 'password',
        username: 'qixu',
        password: 'Newyear2023!',
        client_id: 'GrantValidatorClient',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    .then((response) => {
      token = response.data.access_token;
      return response.data;
    });
}

export async function getCameras(): Promise<any> {
  return http
    .get('api/rest/v1/cameras', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    });
}
