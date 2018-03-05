<template>
  <div class="flex row">
    <div class="col" v-if="authToken">
      <h5>Upload your own mod</h5>
      <q-stepper ref="stepper" style="max-width: 800px" alternative-labels>
        <q-step default name="data" title="Enter data" :error="errors.slug || errors.title || errors.description">
          <p>Please enter a title and description for your mod</p>
          <div class="text-negative" v-if="errors.slug">
            {{ errors.slug }}
          </div>
          <div class="group">
            <q-field :error="errors.title !== undefined"
                     :error-label="errors.title"
                     icon="fa-pencil">
              <q-input v-model="title" float-label="Title" />
            </q-field>
            <q-field :error="errors.tags !== undefined"
                     :error-label="errors.tags"
                     icon="fa-tags">
              <q-chips-input v-model="tags" float-label="Tags"></q-chips-input>
            </q-field>
            <q-field :error="errors.description !== undefined"
                     :error-label="errors.description"
                     icon="fa-bars">
              <q-input v-model="description" type="textarea" float-label="Description (Markdown possible)" />
            </q-field>
          </div>
          <q-stepper-navigation>
            <q-btn color="primary" :disabled="!description || !title" @click="$refs.stepper.next()">Next</q-btn>
          </q-stepper-navigation>
          <h5>Description Preview</h5>
          <vue-markdown class="markdown indent" :html="false" :source="description"></vue-markdown>
        </q-step>
        <q-step name="pic" title="Add image">
          <p>You can upload an image, e.g. a screenshot, that will be used as a preview for your mod</p>
          <q-alert color="warning"
                   enter="bounceInLeft"
                   appear>
            Please note that you must not upload anything protected by copyrights you do not own or don't have explicit permission to upload by the owner
          </q-alert>
          <dropzone id="picDropzone"
                    ref="picDropzone"
                    @vdropzone-success="picUploadSuccess"
                    :options="picDropzoneOptions">
          </dropzone>
          <q-stepper-navigation>
            <q-btn color="primary" flat @click="$refs.stepper.previous()">Back</q-btn>
            <q-btn color="primary" @click="$refs.stepper.next()">Next</q-btn>
            <transition enter="fadeIn" leave="fadeOut">
              <q-btn v-if="pic"
                     icon-right="fa-trash-o"
                     color="negative"
                     outline
                     @click="$refs.picDropzone.removeAllFiles();pic = null;$refs.picDropzone.enable()">
                Use another image
              </q-btn>
            </transition>
          </q-stepper-navigation>
        </q-step>
        <q-step name="files" title="Add files">
          <p>Now please upload your mod files (e.g. the .ocs file). You have to upload at least one file</p>
          <q-alert color="warning"
                   enter="bounceInLeft"
                   appear>
            Please note that you must not upload anything protected by copyrights you do not own or don't have explicit permission to upload by the owner
          </q-alert>
          <dropzone id="filesDropzone"
                    ref="filesDropzone"
                    @vdropzone-success="uploadSuccess"
                    :options="filesDropzoneOptions">
          </dropzone>
          <table class="q-table horizontal-separator" v-if="files.length > 0">
            <thead>
            <tr>
              <th>Filename</th>
              <th>ID</th>
              <th>Size</th>
              <th></th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(file, idx) of files" :key="file._id">
              <td>{{ file.filename }}</td>
              <td>{{ file._id }}</td>
              <td>{{ file.length | prettyBytes }}</td>
              <td>uploaded {{ file.uploadDate|moment("from") }}</td>
              <td><q-btn round color="negative" small icon="fa-trash" @click="deleteFile(idx)"></q-btn></td>
            </tr>
            </tbody>
          </table>
          <q-stepper-navigation>
            <q-btn color="primary" flat @click="$refs.stepper.previous()">Back</q-btn>
            <q-btn color="primary" :disabled="!files.length" @click="$refs.stepper.next()">Next</q-btn>
          </q-stepper-navigation>
        </q-step>
        <q-step name="final" title="Finalize upload">
          <q-field :error="errors.copyright"
                   :error-label="errors.copyright">
            <q-checkbox v-model="copyright"
                        label="I hereby confirm that I am the copyright owner of all content I upload, or that the copyright owner has granted me permission to do so" />
          </q-field>
          <q-stepper-navigation>
            <q-btn color="primary" flat @click="$refs.stepper.previous()">Back</q-btn>
            <q-btn color="positive" icon="fa-save" @click="postUpload" :disabled="!uploadEnabled">Save mod</q-btn>
          </q-stepper-navigation>
        </q-step>
        <q-step name="done" title="Done">
          <h6 class="text-positive" v-if="savedScenario">
            Successfully saved your mod with the id {{ savedScenario._id }}
          </h6>
          <q-stepper-navigation>
            <q-btn color="warning" icon="fa-refresh" @click="reset">Upload another one</q-btn>
            <q-btn color="primary"
                   icon="fa-eye"
                   @click="$router.push({name: 'upload-detail', params: {uploadId: savedScenario._id}})">
              Show the saved mod
            </q-btn>
          </q-stepper-navigation>
        </q-step>
        <q-inner-loading :visible="saving" />
      </q-stepper>
    </div>
    <div v-else>
      Please log in first
    </div>
  </div>
</template>

<script>
  import Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'
  import VueMarkdown from 'vue-markdown'

  import {
    LocalStorage,
  } from 'quasar'

  export default {
    components: {
      Dropzone,
      VueMarkdown,
    },
    data () {
      return {
        files: [],
        tags: [],
        title: '',
        description: '',
        slug: '',
        errors: {},
        pic: null,
        savedScenario: null,
        selectedFile: null,
        copyright: false,
        saving: false,
      }
    },
    mounted () {
      this.files = LocalStorage.get.item('uploadedFiles') || []
    },
    computed: {
      authToken () {
        return this.$store.state.user.authToken
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
      picDropzoneOptions () {
        return {
          url: `${this.$http.defaults.baseURL}/media`,
          paramName: 'media',
          headers: { Authorization: `Bearer ${this.$store.state.user.authToken}` },
          acceptedFiles: '.png,.jpg',
          dictDefaultMessage: "<p><i class='fa fa-3x fa-cloud-upload'></i></p><p>Drop your image here or click to upload</p>",
          maxFilesize: 3, // MB
          maxFiles: 1,
          thumbnailWidth: null,
          thumbnailHeight: 300,
          createImageThumbnails: true,
          thumbnailMethod: 'contain',
        }
      },
      uploadEnabled () {
        return this.files.length > 0 && this.copyright
      },
      picSrc () {
        if (!this.pic) {
          return ''
        }
        return `${this.$http.defaults.baseURL}/media/${this.pic._id}`
      },
    },
    watch: {
      files (val, oldVal) {
        if (!oldVal || val.length !== oldVal.length) {
          LocalStorage.set('uploadedFiles', this.files)
        }
      },
    },
    methods: {
      deleteFile (idx) {
        let file = this.files[idx]
        this.files.splice(idx, 1)
        this.$http.delete(`${this.$http.defaults.baseURL}/media/${file._id}`)
      },
      picUploadSuccess (file, response) {
        this.pic = response
        this.$refs.picDropzone.disable()
      },
      uploadSuccess (file, response) {
        console.log({success: file, xhr: response})
        this.files.push(response)
        this.$refs.filesDropzone.removeFile(file)
      },
      postUpload () {
        let that = this
        this.saving = true
        this.errors = {}
        if (!this.copyright) {
          this.errors.copyright = 'You have to accept the copyright notice'
          this.saving = false
          that.$refs.stepper.goToStep('final')
          return
        }
        if (this.files.length === 0) {
          this.errors.files = 'Please upload at least one file'
          this.saving = false
          that.$refs.stepper.goToStep('files')
          return
        }
        let params = {
          title: this.title,
          description: this.description,
          files: this.files.map(el => el._id),
          pic: this.pic,
          tags: this.tags,
        }
        this.$http.post('/uploads', params)
          .then((response) => {
            that.savedScenario = response.data
            that.saving = false
            that.$refs.stepper.goToStep('done')
          })
          .catch((error) => {
            that.errors.slug = (error.response.data.error.errors.slug || {}).message
            that.errors.title = (error.response.data.error.errors.title || {}).message
            that.errors.description = (error.response.data.error.errors.description || {}).message
            that.saving = false
            that.$refs.stepper.goToStep('data')
          })
      },
      reset () {
        this.title = ''
        this.description = ''
        this.savedScenario = ''
        this.errors = {}
        this.pic = null
        this.files = []
      },
    },
  }
</script>
