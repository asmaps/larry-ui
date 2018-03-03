<template>
  <div>
    <div v-if="!$store.getters['user/loggedIn']">
      <div v-if="useLarryLogin" class="group">
        <h5>Larry Login</h5>
        <p v-if="authError" class="text-negative">
          <span v-if="typeof authError === 'object'">Email or password {{ authError['email or password'] }}</span>
          <span v-else>{{ authError }}</span>
        </p>
        <div class="group">
          <q-input @keyup.enter="larryLogin" :error="authError !== undefined" v-model="email" name="user" float-label="Email" />
          <q-input @keyup.enter="larryLogin" :error="authError !== undefined" v-model="password" name="pass" type="password" float-label="Password" />
          <q-btn color="positive" @click="larryLogin" icon="fa-sign-in">Larry login</q-btn>
        </div>
        <div class="text-right">
          <q-btn color="tertiary" small outline @click="useLarryLogin = false">Log in via Clonkspot</q-btn>
        </div>
      </div>
      <div v-else class="group">
        <q-btn color="positive" @click="clonkspotLogin">Log in via Clonkspot</q-btn>
        <p class="text-negative" v-if="authFailed">Oups, something went wrong. Please try again</p>
        <div class="text-right">
          <q-btn color="tertiary" small outline @click="useLarryLogin = true">Log in via Larry</q-btn>
        </div>
      </div>
    </div>
    <div v-else>
      <q-card>
        <q-card-title class="bg-positive text-white">
          Hi {{ $store.state.user.decodedToken.username }}
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <p>You have successfully logged in!</p>
          <q-btn color="negative" outline small icon="fa-sign-out" @click="$store.commit('user/logout')">Logout</q-btn>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
  import {
    openURL,
    LocalStorage,
  } from 'quasar'

  export default {
    data () {
      return {
        email: '',
        password: '',
        authError: undefined,
        token: null,
        useLarryLogin: false,
        authWindow: null,
        authFailed: false,
      }
    },
    mounted () {
      let token = LocalStorage.get.item('authToken')
      if (token) {
        this.$store.commit('user/setAuthToken', { authToken: token })
      }
    },
    methods: {
      clonkspotLogin () {
        this.authWindow = openURL(`${this.$http.defaults.baseURL}/auth/clonkspot`)
        this.checkTokenLoop()
      },
      larryLogin () {
        let that = this
        let params = {
          user: {
            email: this.email,
            password: this.password,
          }
        }
        this.authError = undefined
        this.$http.post('/auth/login', params).then((response) => {
          that.$store.commit('user/setAuthToken', { authToken: response.data.user.token })
          that.email = ''
          that.password = ''
        }).catch((error) => {
          if (error.response && error.response.data) {
            that.authError = error.response.data.errors
          }
          else if (error.message) {
            that.authError = error.message
          }
          else {
            that.authError = 'Failed to log in'
            console.error({error})
          }
        })
      },
      checkTokenLoop (retryCount) {
        let token = LocalStorage.get.item('authToken')
        if (token) {
          this.$store.commit('user/setAuthToken', { authToken: token })
          this.authWindow.close()
          this.authWindow = null
        }
        else {
          setTimeout(this.checkTokenLoop, 500)
        }
      },
    },
  }
</script>

<style lang="styl" type="text/stylus" scoped>
</style>
