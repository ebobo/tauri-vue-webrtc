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
      `idp/connect/token`,
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

//getCameras
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

//webRTC

//initiateWebRTCSession
export async function initiateWebRTCSession(cameraID: string): Promise<any> {
  const body = { cameraId: cameraID, resolution: 'notInUse' };
  return http
    .post('api/WebRTC/v1/WebRTCSession', body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
    .then((response) => {
      return response.data;
    });
}

//updateAnswerSDP
export async function updateAnswerSDP(
  data: any,
  localDescription: any
): Promise<any> {
  data['answerSDP'] = localDescription;
  return http
    .put('api/WebRTC/v1/WebRTCSession', data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
    .then((response) => {
      return response.data;
    });
}

//addServerIceCandidate
export async function addServerIceCandidate(sessionId: string): Promise<any> {
  return http
    .get(`api/WebRTC/v1/IceCandidates/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    });
}
