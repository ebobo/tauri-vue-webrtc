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

//getServices
export async function verifyUris(): Promise<any> {
  return http.get('api/.well-known/uris').then((response) => {
    return response.data;
  });
}

export async function signinAPIgateway(
  user: string,
  password: string
): Promise<SigninAPIgatewayResponse> {
  return http
    .post<SigninAPIgatewayResponse>(
      `idp/connect/token`,
      qs.stringify({
        grant_type: 'password',
        username: user,
        password: password,
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
      console.log(response.data);
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

// initiateWebRTCSession with cameraID
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
export async function getServerIceCandidate(sessionId: string): Promise<any> {
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

//sendIceCandidate
export async function sendIceCandidate(
  sessionId: string,
  candidate: any
): Promise<any> {
  const body = { sessionId: sessionId, candidates: [candidate] };
  return http
    .post('api/WebRTC/v1/IceCandidates', body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    })
    .then((response) => {
      return response.data;
    });
}
