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
          <q-btn @click="openInOpenclonk"
                 color="positive"
                 outline
                 icon="fa-download"
                 label="Install mod with OpenClonk" />
          <q-btn v-if="isAuthor"
                 outline
                 color="negative"
                 icon="fa-trash"
                 @click="deleteUpload(upload)"
                 label="Delete mod" />
        </q-card-actions>
        <q-card-main>
          <div class="row gutter-sm">
            <p class="col text-faded">
              <vue-markdown class="markdown" :html="false" :source="upload.description"></vue-markdown>
            </p>
            <div :class="editDescription ? 'col-md-6' : 'col-auto'" v-if="isAuthor">
              <div class="text-right group">
                <q-btn outline
                       round
                       v-if="editDescription"
                       @click="saveUpload()"
                       color="positive"
                       size="sm"
                       icon="fa-save" />
                <q-btn outline
                       round
                       v-if="editDescription"
                       @click="editDescription = false; refresh()"
                       size="sm"
                       color="negative"
                       icon="fa-times" />
                <q-btn outline
                       round
                       v-if="!editDescription"
                       @click="editDescription = true"
                       size="sm"
                       icon="fa-edit" />
              </div>
              <q-input v-if="editDescription"
                       v-model="upload.description"
                       type="textarea" />
            </div>
          </div>
        </q-card-main>
        <q-card-separator />
        <q-card-title>
          <i class="far fa-hand-point-right"></i> Tags
          <span v-if="isAuthor">
            <q-btn outline
                   round
                   v-if="editTags"
                   @click="saveUpload()"
                   color="positive"
                   size="sm"
                   icon="fa-save" />
            <q-btn outline
                   round
                   v-if="editTags"
                   @click="editTags = false; refresh()"
                   size="sm"
                   color="negative"
                   icon="fa-times" />
            <q-btn outline
                   round
                   v-if="!editTags"
                   @click="editTags = true"
                   size="sm"
                   icon="fa-edit" />
          </span>
        </q-card-title>
        <q-card-main>
          <div v-if="!editTags" class="group">
            <q-chip v-for="tag of upload.tags" :key="tag">{{ tag }}</q-chip>
          </div>
          <q-chips-input v-model="upload.tags"
                         v-else
                         float-label="Tags" />
        </q-card-main>
        <q-card-separator />
        <q-card-title><i class="far fa-hand-point-right"></i> Comments</q-card-title>
        <q-card-main>
          <p v-if="loggedIn">
            <q-input
              v-model="comment"
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
          </p>
          <div v-else>
            <em>Please log in to comment</em>
          </div>
          <div class="flex row no-wrap items-center"
               v-for="comment of comments.comments"
               :key="comment._id">
            <q-chat-message
              style="max-width: 90%"
              :bg-color="comment.voting.sum > 0 ? 'light-green-2' : ( comment.voting.sum === 0 ? 'grey-3' : 'red-2')"
              :name="(comment.author || {}).username"
              :text="comment.body.split('\n').filter(el => el.trim() !== '')"
              :stamp="$moment(comment.createdAt).format('LLLL')" />
            <q-btn v-if="isAuthor"
                   outline
                   round
                   size="sm"
                   icon="fa-trash"
                   color="negative"
                   @click="deleteComment(comment)"/>
            <comment-voter @voted="loadComments" :comment="comment"></comment-voter>
          </div>
        </q-card-main>
        <q-card-separator />
        <q-card-title>
          <i class="far fa-hand-point-right"></i> Voting
        </q-card-title>
        <q-card-main>
          <div class="group">
            <upload-voter :upload="upload" @voted="refresh"></upload-voter>
          </div>
        </q-card-main>
        <q-card-separator />
        <q-card-title>
          <i class="far fa-hand-point-right"></i> Dependencies
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
        <q-card-separator />
        <q-card-title>
          <i class="far fa-hand-point-right"></i> File downloads
          <span v-if="isAuthor">
            <q-btn outline
                   round
                   v-if="editFiles"
                   @click="saveUpload()"
                   color="positive"
                   size="sm"
                   icon="fa-save" />
            <q-btn outline
                   round
                   v-if="editFiles"
                   @click="editFiles = false; refresh()"
                   size="sm"
                   color="negative"
                   icon="fa-times" />
            <q-btn outline
                   round
                   v-if="!editFiles"
                   @click="editFiles = true"
                   size="sm"
                   icon="fa-edit" />
          </span>
        </q-card-title>
        <q-card-main>
          <q-btn disabled flat v-if="!Array.isArray(upload.files) || upload.files.length === 0">
            No files
          </q-btn>
          <div class="group"
               v-else
               v-for="(fid, idx) of upload.files"
               :key="fid._id">
            <q-btn loader
                   no-caps
                   outline
                   icon="fa-download"
                   color="primary"
                   :percentage="(downloadProgresses[fid._id] || {}).percentage"
                   :loading="downloadProgresses[fid._id] && downloadProgresses[fid._id].percentage < 100"
                   @click="(event, done) => {downloadMedia(fid._id, fid.filename, done)}"
                   :label="`${fid.filename} (${$options.filters.prettyBytes(fid.length)})`">
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
            <q-btn v-if="isAuthor && editFiles"
                   outline
                   round
                   size="sm"
                   icon="fa-trash"
                   color="negative"
                   @click="upload.files.splice(idx, 1)"/>
          </div>
          <div v-if="editFiles">
            <dropzone id="filesDropzone"
                      ref="filesDropzone"
                      @vdropzone-success="uploadSuccess"
                      :options="filesDropzoneOptions">
            </dropzone>
          </div>
        </q-card-main>
        <q-card-separator />
        <q-card-title>
          <i class="far fa-hand-point-right"></i> Other data
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
  import Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'
  import { openURL } from 'quasar'
  import UploadVoter from 'components/UploadVoter'
  import CommentVoter from 'components/CommentVoter'
  import FileSaver from 'file-saver'
  import VueMarkdown from 'vue-markdown'

  export default {
    components: {
      CommentVoter,
      Dropzone,
      UploadVoter,
      VueMarkdown,
    },
    computed: {
      routeId () {
        return this.$route.params.uploadId
      },
      isAuthor () {
        return this.upload && this.upload.author && this.upload.author.username === this.username
      },
      username () {
        return this.$store.state.user.decodedToken.username
      },
      loggedIn () {
        return this.$store.getters['user/loggedIn']
      },
      filesDropzoneOptions () {
        return {
          url: `${this.$http.defaults.baseURL}/media`,
          paramName: 'media',
          headers: { Authorization: `Bearer ${this.$store.state.user.authToken}` },
          acceptedFiles: '.ocs,.ocf,.ocd,.ocg,.ocr,.c4d,.c4g,.c4f,.c4r,.c4s,c4v',
          dictDefaultMessage: "<p><i class='fa fa-3x fa-cloud-upload'></i></p><p>Drop your mod files here or click to upload</p>",
          maxFilesize: 30, // MB
        }
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
        editDescription: false,
        editTags: false,
        editFiles: false,
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
      uploadSuccess (file, response) {
        this.upload.files.push(response)
        this.$refs.filesDropzone.removeFile(file)
        this.$q.notify({type: 'positive', message: 'File uploaded successfully. Press the save button to activate it.'})
      },
      saveUpload () {
        let that = this
        this.$http.put(`/uploads/${this.upload._id}`, this.upload).then(response => {
          that.editDescription = false
          that.editTags = false
          that.editFiles = false
          that.refresh()
        }).catch(() => that.$q.notify('Failed to save mod'))
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
  .q-card-main
    margin-left: 1rem
</style>
