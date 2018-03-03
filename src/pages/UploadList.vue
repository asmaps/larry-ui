<template>
  <div>
    <transition :enter="showList ? 'fadeInLeft' : 'fadeInRight'" :leave="showList ? 'fadeOutRight' : 'fadeOutLeft'" mode="out-in" duration="500">
      <div v-if="showList">
        <h4>Available Mods</h4>
        <q-table
          no-data-label="No mods available"
          :data="uploads"
          :config="tableConfig"
          :columns="tableColumns"
          @refresh="refresh">
          <template slot='col-action' slot-scope='cell'>
            <q-btn color="primary"
                   small
                   outline
                   icon="fa-info-circle"
                   @click="$router.push({name: 'upload-detail', params: {uploadId: cell.row._id}})">
              Details</q-btn>
            <q-btn color="negative"
                   outline
                   small
                   icon="fa-trash-o"
                   v-if="cell.row.author.username === $store.state.user.decodedToken.username"
                   @click="deleteUpload(cell.row)">
              Delete</q-btn>
          </template>
          <template slot='col-voting' slot-scope='cell'>
            {{ cell.data.sum }} <i class="fa" :class="{'fa-caret-up text-positive': cell.data.sum > 0, 'fa-caret-down text-negative': cell.data.sum < 0, 'fa-sort text-dark': cell.data.sum === 0}"></i>
          </template>
        </q-table>
      </div>
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
  import {
    Dialog,
  } from 'quasar'
  import Truncate from 'vue-truncate-collapsed'
  import moment from 'moment'

  export default {
    components: {
      Truncate,
    },
    computed: {
      showList () {
        return this.$route.name === 'upload-list'
      }
    },
    watch: {
      showList: {
        handler (val, oldVal) {
          if (val && val !== oldVal) {
            this.refresh()
          }
        },
        immediate: true,
      }
    },
    data () {
      return {
        response: {},
        uploads: [],
        tableConfig: {
          refresh: true,
          leftStickyColumns: 1,
          rightStickyColumns: 3,
          rowHeight: '60px',
        },
        tableColumns: [
          {label: 'Title', field: 'title', width: '100px'},
          {label: 'Description', field: 'description', width: '500px'},
          {label: 'Author', field: 'author', width: '100px', format: el => el.username},
          {label: 'Voting', field: 'voting', width: '100px'},
          {label: 'Last update', field: 'updatedAt', width: '100px', format: el => moment(el).from()},
          {label: 'Actions', field: 'action', width: '200px'},
        ],
      }
    },
    methods: {
      refresh (done) {
        let that = this
        this.$http.get('/uploads').then((response) => {
          that.response = response
          that.uploads = response.data.uploads
          if (done) {
            done()
          }
        })
      },
      deleteUpload (upload) {
        let that = this
        Dialog.create({
          title: 'Delete mod?',
          message: `Do you really want to delete the mod ${upload.title}?<br>This cannot be undone!`,
          buttons: [
            'Cancel',
            {
              label: '<i class="fa fa-trash-o"></i> Yes, delete!',
              color: 'negative',
              outline: true,
              handler () {
                that.$http.delete(`/uploads/${upload._id}`).then(response => that.refresh())
              }
            }
          ]
        })
      },
    },
  }
</script>

<style lang="styl" type="text/stylus" scoped>
  .description
    max-width: 400px
</style>
