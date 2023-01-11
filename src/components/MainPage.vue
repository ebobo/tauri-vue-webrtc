<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img :src="logo" class="my-3" contain height="100" />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Tauri + Vite + Vue3 + Vuetify3 + TypeScript
        </h1>

        <h4>MileStore CCTV intergration Testing</h4>

        <p class="subheading font-weight-regular">
          For display video streaming
        </p>
      </v-col>
    </v-row>
    <v-row justify="center">
      <video width="500" id="videoCtl" muted loop autoplay controls>
        Your browser does not support the video tag.
      </video>
    </v-row>
    <v-row justify="center">
      <v-col cols="6">
        <v-text-field
          label="server ip"
          class="text-editor"
          v-model="server"
          variant="underlined"
          color="#82b1ff"
          :append-inner-icon="
            serverOK ? 'mdi-check-circle-outline' : 'mdi-close-outline'
          "
        ></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn class="verify-button" @click="verifyServer">Verify</v-btn>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="4">
        <v-text-field
          class="text-editor"
          label="user name"
          v-model="user"
          variant="underlined"
          color="#82b1ff"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field
          class="text-editor"
          label="password"
          v-model="password"
          variant="underlined"
          color="#82b1ff"
          type="password"
        ></v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn class="login-button" @click="loginAPIServer">Login</v-btn>
      </v-col>
    </v-row>
    <v-row justify="center"> </v-row>

    <v-row justify="center">
      <v-col cols="10">
        <v-combobox
          v-model="selectedCamera"
          :items="cameraDisplayNames"
          label="Combobox"
          outlined
          dense
        ></v-combobox>
      </v-col>
      <v-col cols="2">
        <v-btn class="button" @click="connectToCamera">Connect</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  verifyUris,
  signinAPIgateway,
  getCameras,
  initiateWebRTCSession,
  updateAnswerSDP,
  addServerIceCandidate,
} from '../service/rest';

// Logo
import logo from '../assets/autronica_logo.png';
const STUN_URL = 'stun:stun1.l.google.com:19302';

interface Camera {
  displayName: string;
  name: string;
  id: string;
}

export default defineComponent({
  name: 'Main',

  data() {
    return {
      logo,
      server: process.env.VITE_APP_SERVER_PATH,
      cameras: [] as Camera[],
      selectedCamera: '',
      peerConnection: null,
      user: 'qixu',
      password: 'Newyear2023!',
      serverOK: false,
    };
  },
  created() {
    console.log('server path:');
    console.log(process.env.VITE_APP_SERVER_PATH);
    // this.loginAPIServer();
  },

  computed: {
    cameraDisplayNames() {
      if (this.cameras.length > 0) {
        return this.cameras.map((camera: Camera) => camera.displayName);
      }
    },
    selectCameraID(): string | undefined {
      return this.cameras.find((camera: Camera) => {
        return camera.displayName === this.selectedCamera;
      })?.id;
    },
  },

  methods: {
    verifyServer() {
      verifyUris()
        .then(() => {
          this.serverOK = true;
        })
        .catch((err) => {
          this.serverOK = false;
          console.log(err);
        });
    },

    loginAPIServer() {
      if (this.user === '' || this.password === '') return;
      console.log(this.user, this.password);
      signinAPIgateway(this.user, this.password)
        .then(() => {
          console.log('login success');
          this.cameras = [];
          getCameras()
            .then((res) => {
              res.array.forEach((obj: any) => {
                this.cameras.push({
                  displayName: obj.displayName,
                  name: obj.name,
                  id: obj.id,
                });
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    },

    async connectToCamera() {
      if (this.selectCameraID === undefined) return;
      if (this.peerConnection != null) await this.peerConnection.close();
      console.log('connectToCamera');

      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: STUN_URL }],
      });

      this.peerConnection.ontrack = (event: any) => {
        console.log('ontrack');
        const video = document.getElementById('videoCtl') as HTMLVideoElement;
        video.srcObject = event.streams[0];
      };

      this.peerConnection.onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log('onicecandidate');
          console.log(event.candidate);
        }
      };
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log(
          'Connection state changed: ' + this.peerConnection.connectionState
        );
      };

      initiateWebRTCSession(this.selectCameraID).then((res) => {
        const offer = new RTCSessionDescription(JSON.parse(res.offerSDP));
        this.peerConnection
          .setRemoteDescription(offer)
          .then(() => {
            console.log('setRemoteDescription');
            return this.peerConnection.createAnswer();
          })
          .then((answer: any) => {
            console.log('createAnswer');
            return this.peerConnection.setLocalDescription(answer);
          })
          .then(() => {
            updateAnswerSDP(
              res,
              JSON.stringify(this.peerConnection.localDescription)
            )
              .then(() => {
                addServerIceCandidate(res.sessionId).then((res) => {
                  console.log(res);
                  res.candidates.forEach((candidate: any) => {
                    this.peerConnection.addIceCandidate(
                      new RTCIceCandidate(JSON.parse(candidate))
                    );
                  });
                });
              })
              .catch((err: any) => {
                console.log(err);
              });
          })
          .catch((err: any) => {
            console.log(err);
          });
      });
    },
  },
});
</script>

<style lang="scss" scoped>
/* .text-editor {
  margin-top: 1rem;
  width: 100px;
  height: 60px;
} */

.text-editor input {
  text-align: center;
}

.button {
  margin-top: 1.5rem;
  margin-left: 0.5rem;
  color: #fff;
  background-color: #82b1ff;
}

.login-button {
  margin-top: 1.5rem;
  margin-left: 0.5rem;
  background-color: greenyellow;
}

.verify-button {
  margin-top: 1.5rem;
  margin-left: 0.5rem;
  background-color: orange;
}
</style>
