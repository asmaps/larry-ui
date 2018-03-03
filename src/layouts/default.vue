<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar color="primary" glossy>

        <q-toolbar-title>
          Larry UI
          <div slot="subtitle">Official source of mods for OpenClonk</div>
        </q-toolbar-title>

        <q-toolbar-title v-if="$store.getters['user/loggedIn']">
          Hi {{ $store.state.user.decodedToken.username }}
        </q-toolbar-title>
        <q-btn flat icon="fa-sign-out" v-if="$store.getters['user/loggedIn']" @click="$store.commit('user/logout')">
          Logout
        </q-btn>
      </q-toolbar>

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
</style>
