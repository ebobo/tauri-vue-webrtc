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
      <video width="500" muted loop autoplay controls>
        Your browser does not support the video tag.
      </video>
    </v-row>
    <v-row justify="center">
      <v-col cols="8">
        <v-text-field
          class="text-editor"
          v-model="server"
          variant="underlined"
          color="#82b1ff"
        ></v-text-field>
      </v-col>
    </v-row>

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

import { signinAPIgateway, getCameras } from '../service/rest';

// Logo
import logo from '../assets/autronica_logo.png';

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
    };
  },
  created() {
    console.log('server path:');
    console.log(process.env.VITE_APP_SERVER_PATH);
    this.loginAPIServer();
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
    loginAPIServer() {
      signinAPIgateway()
        .then(() => {
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

    connectToCamera() {
      console.log('connect to camera');
      console.log(this.selectCameraID);
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
</style>
