<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar>
        <q-toolbar-title>
          Larry UI
          <div slot="subtitle">Official source of mods for OpenClonk</div>
        </q-toolbar-title>

        <q-tabs>
          <q-route-tab slot="title"
                       icon="fa-list"
                       :to="{name: 'upload-list'}"
                       replace
                       hide="icon"
                       label="Browse mods" />

          <q-route-tab slot="title"
                       icon="fa-upload"
                       :to="{name: 'upload-create'}"
                       replace hide="icon"
                       label="Upload mod" />
        </q-tabs>

        <q-btn flat icon="fa-sign-out" v-if="$store.getters['user/loggedIn']" @click="$store.commit('user/logout')">
          Logout
        </q-btn>
      </q-toolbar>

    </q-layout-header>

    <q-page-container>
      <q-page padding>
        <div class="flex row items-end reverse-wrap gutter-md">
          <div class="col">
            <transition mode="out-in"
                        duration="200"
                        enter-active-class="animated fadeIn"
                        leave-active-class="animated fadeOut">
              <router-view></router-view>
            </transition>
          </div>
          <div class="col-auto" v-if="!$store.getters['user/loggedIn']">
            <api-auth></api-auth>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>

  import ApiAuth from 'components/ApiAuth'

  export default {
    name: 'LayoutDefault',
    components: {
      ApiAuth,
    },
    data () {
      return {
      }
    },
    methods: {
    }
  }
</script>

<style>
  body {
    background: white url('/statics/bodybg.jpg') no-repeat fixed;
  }

  .q-layout-header .q-toolbar {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .q-layout-header .q-tabs-head {
    background-color: transparent;
  }

  .light-bg, .q-card, .q-stepper {
    background-color: rgba(255, 255, 255, 0.8);
  }

  .indent {
    margin-left: 1rem;
  }

  .markdown h1 {
    font-size: 1.1rem;
    font-style: italic;
    font-weight: bold;
  }

  .markdown h2 {
    font-size: 1.1rem;
    font-style: italic;
    font-weight: 500;
  }

  .markdown h3 {
    font-size: 1.1rem;
    font-style: italic;
  }

  .markdown h4, .markdown h5, .markdown h6 {
    font-size: 1.0rem;
    font-style: italic;
  }

  .markdown img {
    display: none;
  }
</style>
