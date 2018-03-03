<template>
  <div>
    <transition :enter="showList ? 'fadeInLeft' : 'fadeInRight'" :leave="showList ? 'fadeOutRight' : 'fadeOutLeft'" mode="out-in" duration="500">
      <div v-if="showList">
        <h4>Available Mods</h4>
        <q-table
          no-data-label="No mods available"
          row-key="name"
          :data="uploads"
          :config="tableConfig"
          :columns="tableColumns"
          @refresh="refresh">
          <q-td slot='body-cell-action' slot-scope="props" :props='props'>
            <q-btn color="primary"
                   small
                   outline
                   icon="fa-info-circle"
                   @click="$router.push({name: 'upload-detail', params: {uploadId: props.row._id}})">
              Details</q-btn>
            <q-btn color="negative"
                   outline
                   small
                   icon="fa-trash-o"
                   v-if="props.row.author.username === $store.state.user.decodedToken.username"
                   @click="deleteUpload(cell.row)">
              Delete</q-btn>
          </q-td>
          <q-td slot='body-cell-voting' slot-scope="props" :props='props'>
            {{ props.value.sum }} <i class="fa" :class="{'fa-caret-up text-positive': props.value.sum > 0, 'fa-caret-down text-negative': props.value.sum < 0, 'fa-sort text-dark': props.value.sum === 0}"></i>
          </q-td>
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
  import moment from 'moment'

  export default {
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
          {name: 'title', label: 'Title', field: 'title'},
          {
            name: 'description',
            label: 'Description',
            field: 'description',
            format: el => typeof el === 'string' && el.length > 150 ? el.slice(0, 150) + '...' : el,
          },
          {name: 'author', label: 'Author', field: row => row.author.username},
          {name: 'voting', label: 'Voting', field: 'voting'},
          {
            name: 'updatedAt',
            label: 'Last update',
            field: 'updatedAt',
            format: el => moment(el).from(),
          },
          {name: 'action', label: 'Actions', field: 'action'},
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
