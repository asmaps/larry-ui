<template>
  <div>
    <div v-if="upload">
      <q-card>
        <q-card-media v-if="upload.pic" overlay-position="top">
          <q-card-title slot="overlay">
            {{ upload.title }}
            <span slot="subtitle">
              by {{ upload.author.username }},
              updated {{ upload.updatedAt | moment("from") }}
            </span>
            <span slot="right" class="text-white" style="margin-left: 3rem">
            <q-btn @click="$router.push({name: 'upload-list'})" flat round icon="fa-times" color="negative"/>
            </span>
          </q-card-title>
          <img :src="`${$http.defaults.baseURL}/media/${upload.pic._id}`">
        </q-card-media>
        <q-card-title class="bg-positive text-white" v-else>
          {{ upload.title }}
          <span slot="subtitle" class="text-light">by {{ upload.author.username }}</span>
          <span slot="right" class="text-light" style="margin-left: 3rem">updated {{ upload.updatedAt | moment("from") }}</span>
        </q-card-title>
        <q-card-separator />
        <q-card-actions>
          <q-btn @click="openInOpenclonk" color="positive" outline>
            Install mod with OpenClonk
          </q-btn>
          <q-btn v-if="username === upload.author.username"
                 outline
                 color="negative"
                 icon="fa-trash-o"
                 @click="deleteUpload(upload)">
            Delete mod
          </q-btn>
        </q-card-actions>
        <q-card-main>
          <p class="text-faded">
            {{ upload.description }}
          </p>
          <div class="group">
            <q-chip v-for="tag of upload.tags" :key="tag">{{ tag }}</q-chip>
          </div>
        </q-card-main>
        <q-card-title>Comments</q-card-title>
        <q-card-main>
          <div class="flex row no-wrap items-center"
               v-for="comment of comments.comments"
               :key="comment._id">
            <q-chat-message
              style="max-width: 90%"
              :bg-color="comment.voting.sum > 0 ? 'light-green-2' : ( comment.voting.sum === 0 ? 'grey-3' : 'red-2')"
              :name="(comment.author || {}).username"
              :text="comment.body.split('\n').filter(el => el.trim() !== '')"
              :stamp="$moment(comment.createdAt).format('LLLL')" />
            <q-btn v-if="username === comment.author.username"
                   flat
                   size="sm"
                   icon="fa-trash"
                   color="negative"
                   @click="deleteComment(comment)"/>
            <comment-voter @voted="loadComments" :comment="comment"></comment-voter>
          </div>
          <div>
            <q-input
              v-model="comment"
              type="textarea"
              placeholder="Write a comment"
              :max-height="100"
              @keyup.enter="sendComment"
              :after="[
                        {
                          icon: 'fa-paper-plane',
                          content: true,
                          handler () {
                            sendComment()
                          }
                        }
                      ]"
            />
            <q-inner-loading :visible="commentSaving"><q-spinner-comment></q-spinner-comment></q-inner-loading>
          </div>
        </q-card-main>
        <q-card-media v-if="upload.pic" overlay-position="bottom">
          <q-card-title slot="overlay">
            Voting
          </q-card-title>
          <q-parallax :src="`${$http.defaults.baseURL}/media/${upload.pic._id}`" :height="150">
          </q-parallax>
        </q-card-media>
        <q-card-title v-else>
          Voting
        </q-card-title>
        <q-card-main>
          <div class="group">
            <upload-voter :upload="upload" @voted="refresh"></upload-voter>
          </div>
        </q-card-main>
        <q-card-media v-if="upload.pic" overlay-position="bottom">
          <q-card-title slot="overlay">
            Dependencies
          </q-card-title>
          <q-parallax :src="`${$http.defaults.baseURL}/media/${upload.pic._id}`" :height="150">
          </q-parallax>
        </q-card-media>
        <q-card-title v-else>
          Dependencies
        </q-card-title>
        <q-card-main>
          <q-btn disabled flat v-if="!Array.isArray(upload.dependencies) || upload.dependencies.length === 0">
            No dependencies
          </q-btn>
          <div class="group" v-else>
            <div v-for="d of upload.dependencies"
                 :key="d._id">
              <q-btn @click="$router.push({name: 'upload-detail', params: {uploadId: d._id}})" no-caps outline>
                {{ d.title }}
              </q-btn>
            </div>
          </div>
        </q-card-main>
        <q-card-media v-if="upload.pic" overlay-position="bottom">
          <q-card-title slot="overlay">
            File downloads
          </q-card-title>
          <q-parallax :src="`${$http.defaults.baseURL}/media/${upload.pic._id}`" :height="150">
          </q-parallax>
        </q-card-media>
        <q-card-title v-else>
          File downloads
        </q-card-title>
        <q-card-main>
          <q-btn disabled flat v-if="!Array.isArray(upload.files) || upload.files.length === 0">
            No files
          </q-btn>
          <div class="group"
               v-else
               v-for="fid of upload.files"
               :key="fid._id">
            <q-btn loader
                   no-caps
                   color="primary"
                   :percentage="(downloadProgresses[fid._id] || {}).percentage"
                   @click="(event, done) => {downloadMedia(fid._id, fid.filename, done)}">
              {{ fid.filename }} ({{ fid.length|prettyBytes }})
              <span slot="loading">Downloading...</span>
            </q-btn>
            <span v-if="downloadProgresses[fid._id]">
                <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
                  <span key="sizeDownloaded" v-if="downloadProgresses[fid._id].percentage < 100">
                    {{ downloadProgresses[fid._id].loaded|prettyBytes }} / {{ downloadProgresses[fid._id].total|prettyBytes }}
                  </span>
                  <span key="downloadDone" v-else><i class="fa fa-check fa-2x text-positive"></i></span>
                </transition>
              </span>
          </div>
        </q-card-main>
        <q-card-media v-if="upload.pic" overlay-position="bottom">
          <q-card-title slot="overlay">
            Other data
          </q-card-title>
          <q-parallax :src="`${$http.defaults.baseURL}/media/${upload.pic._id}`" :height="150">
          </q-parallax>
        </q-card-media>
        <q-card-title v-else>
          Other data
        </q-card-title>
        <q-card-main>
          <p>ID: {{ upload._id }}</p>
        </q-card-main>
      </q-card>
    </div>
    <div v-else>
      <q-spinner size="50"></q-spinner> Loading mod data...
    </div>
  </div>
</template>

<script>
  import { openURL } from 'quasar'
  import UploadVoter from 'components/UploadVoter'
  import CommentVoter from 'components/CommentVoter'
  import FileSaver from 'file-saver'

  export default {
    components: {
      CommentVoter,
      UploadVoter,
    },
    computed: {
      routeId () {
        return this.$route.params.uploadId
      },
      username () {
        return this.$store.state.user.decodedToken.username
      },
    },
    watch: {
      routeId: {
        handler (val, oldVal) {
          if (val && val !== oldVal) {
            this.refresh()
          }
        },
        immediate: true,
      },
    },
    data () {
      return {
        upload: null,
        downloadProgresses: {},
        comments: [],
        comment: '',
        commentSaving: false,
      }
    },
    methods: {
      refresh () {
        let that = this
        this.$http.get(`/uploads/${this.routeId}`).then(response => {
          that.upload = response.data
          that.loadComments()
        }).catch((error) => {
          if (error.response.status === 404) {
            that.$router.push({name: 'upload-list'})
          }
          else {
            console.error(error)
          }
        })
      },
      loadComments () {
        let that = this
        this.$http.get(`/uploads/${this.routeId}/comments`).then(response => {
          that.comments = response.data
        }).catch((error) => {
          that.$q.notify('Failed loading comments')
          console.error(error)
        })
      },
      deleteUpload (upload) {
        let that = this
        this.$q.dialog({
          title: 'Delete mod?',
          message: `Do you really want to delete the mod "${upload.title}"? This cannot be undone!`,
          ok: {
            label: 'Yes, delete!',
            icon: 'fa-trash',
            color: 'negative',
            outline: true,
          },
          cancel: 'Cancel',
        }).then(() => that.$http.delete(`/uploads/${upload._id}`).then(response => that.refresh()))
      },
      downloadMedia (mediaId, filename, done) {
        console.log({mediaId, done})
        let that = this
        this.$set(this.downloadProgresses, mediaId, {})
        this.$set(this.downloadProgresses[mediaId], 'done', done)
        this.$set(this.downloadProgresses[mediaId], 'percentage', 0)
        this.$set(this.downloadProgresses[mediaId], 'loaded', 0)
        this.$set(this.downloadProgresses[mediaId], 'total', 0)
        this.$http.get(
          `${this.$http.defaults.baseURL}/media/${mediaId}`,
          {
            responseType: 'blob',
            onDownloadProgress: progressEvent => { that.downloadProgress(mediaId, progressEvent) },
          }
        ).then((response) => {
          FileSaver.saveAs(response.data, filename)
          that.downloadProgresses[mediaId].done()
          that.downloadProgresses[mediaId].percentage = 100
        })
      },
      downloadProgress (mediaId, progressEvent) {
        this.downloadProgresses[mediaId].percentage = progressEvent.loaded * 100 / progressEvent.total
        this.downloadProgresses[mediaId].loaded = progressEvent.loaded
        this.downloadProgresses[mediaId].total = progressEvent.total
      },
      openInOpenclonk () {
        openURL(`openclonk://installmod/${this.upload._id}`)
      },
      sendComment () {
        let that = this
        this.commentSaving = true
        if (this.comment.length > 0) {
          this.$http.post(`/uploads/${this.upload._id}/comments`, {body: this.comment}).then(() => {
            that.comment = ''
            that.$q.notify({color: 'positive', icon: 'fa-check', message: 'Comment sent'})
            that.loadComments()
            this.commentSaving = false
          }).catch((error) => {
            that.$q.notify('Error sending your comment')
            that.loadComments()
            this.commentSaving = false
            console.error(error)
          })
        }
      },
      deleteComment (comment) {
        let that = this
        this.$http.delete(`/uploads/${comment.upload}/comments/${comment._id}/`).then(() => that.loadComments())
      },
    }
  }
</script>

<style lang="styl" type="text/stylus" scoped>
</style>
