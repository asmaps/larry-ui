<template>
  <div>
    <div class="flex row items-center group" v-if="$store.getters['user/loggedIn']">
      <span style="margin: 0 1rem">
        <i class="fa"
           :class="{'fa-caret-up text-positive': comment.voting.sum > 0, 'fa-caret-down text-negative': comment.voting.sum < 0, 'fa-sort text-dark': comment.voting.sum === 0}">
        </i>
        {{ comment.voting.sum }}
      </span>
      <span v-if="!myVote">
        <q-btn color="negative" round size="sm" flat icon="fa-thumbs-down" @click="vote(-1)"></q-btn>
        <q-btn color="positive" round size="sm" flat icon="fa-thumbs-up" @click="vote(1)"></q-btn>
      </span>
      <span v-if="myVote">You voted <i :class="`fas fa-thumbs-${myVote.impact === 1 ? 'up text-positive' : 'down text-negative'}`"></i></span>
    </div>
    <div class="group" v-else>
      <i class="fa"
         :class="{'fa-caret-up text-positive': comment.voting.sum > 0, 'fa-caret-down text-negative': comment.voting.sum < 0, 'fa-sort text-dark': comment.voting.sum === 0}">
      </i>
      {{ comment.voting.sum }} votes
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
      comment: Object,
    },
    components: {
      QBtn,
    },
    data () {
      return {}
    },
    computed: {
      myVote () {
        if (!this.comment || !this.comment.voting || !Array.isArray(this.comment.voting.votes) || this.comment.voting.votes.length === 0) {
          return undefined
        }
        return this.comment.voting.votes[0]
      },
    },
    methods: {
      vote (impact) {
        let that = this
        this.$http.post(`/uploads/${this.comment.upload}/comments/${this.comment._id}/vote`, {impact: impact}).then(response => that.$emit('voted'))
      },
    },
  }
</script>

<style lang="styl" type="text/stylus" scoped>
</style>
