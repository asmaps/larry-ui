<template>
  <div>
    <div class="flex row items-center group" v-if="$store.getters['user/loggedIn']">
      <h5 style="margin: 0 1rem">
        <i class="fa"
           :class="{'fa-caret-up text-positive': upload.voting.sum > 0, 'fa-caret-down text-negative': upload.voting.sum < 0, 'fa-sort text-dark': upload.voting.sum === 0}">
        </i>
        {{ upload.voting.sum }}
      </h5>
      <span v-if="upload.author.username !== $store.state.user.decodedToken.username">
        <q-btn color="negative" round small icon="fa-thumbs-down" @click="vote(-1)"></q-btn>
        <q-btn color="positive" round small icon="fa-thumbs-up" @click="vote(1)"></q-btn>
      </span>
    </div>
    <div class="group" v-else>
      <i class="fa"
         :class="{'fa-caret-up text-positive': upload.voting.sum > 0, 'fa-caret-down text-negative': upload.voting.sum < 0, 'fa-sort text-dark': upload.voting.sum === 0}">
      </i>
      {{ upload.voting.sum }} votes
      <em>Please log in to vote</em>
    </div>
  </div>
</template>

<script>
  import {
    QBtn,
  } from 'quasar'

  export default {
    props: {
      upload: Object,
    },
    components: {
      QBtn,
    },
    data () {
      return {}
    },
    methods: {
      vote (impact) {
        let that = this
        this.$http.post(`/uploads/${this.upload._id}/vote`, {vote: {impact: impact}}).then(response => that.$emit('voted'))
      },
    },
  }
</script>

<style lang="styl" type="text/stylus" scoped>
</style>
