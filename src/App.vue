<template>
  <v-app>
    <v-main>
      <MainPage />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MainPage from './components/MainPage.vue';

export default defineComponent({
  name: 'App',

  components: {
    MainPage,
  },

  data() {
    return {
      //
    };
  },
});
</script>
