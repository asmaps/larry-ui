<template>
  <div class="flex row no-wrap gutter-lg">
    <transition name="grow-fade">
      <div v-if="!showList" class="col-sm-12 col-lg-8 col-xl-7">
        <router-view></router-view>
      </div>
    </transition>
    <div class="animateMaxWidth" :class="showList ? 'col-12' : 'gt-md col-lg-4 col-xl-5'">
      <q-table
        no-data-label="No mods available"
        row-key="name"
        :data="uploads"
        :config="tableConfig"
        :columns="tableColumns"
        :visible-columns="visibleColumns"
        @refresh="refresh">
        <q-td slot='body-cell-title' slot-scope="props" :props='props'>
          <router-link :to="{name: 'upload-detail', params: {uploadId: props.row._id}}">{{ props.value }}</router-link>
        </q-td>
        <q-td slot='body-cell-action' slot-scope="props" :props='props'>
          <q-btn color="primary"
                 v-if="$route.params.uploadId !== props.row._id"
                 small
                 outline
                 icon="fa-info-circle"
                 label="Show"
                 @click="$router.push({name: 'upload-detail', params: {uploadId: props.row._id}})" />
        </q-td>
        <q-td slot='body-cell-voting' slot-scope="props" :props='props'>
          {{ props.value.sum }} <i class="fa" :class="{'fa-caret-up text-positive': props.value.sum > 0, 'fa-caret-down text-negative': props.value.sum < 0, 'fa-sort text-dark': props.value.sum === 0}"></i>
        </q-td>
      </q-table>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'

  export default {
    computed: {
      showList () {
        return this.$route.name === 'upload-list'
      },
      visibleColumns () {
        let that = this
        let removeOnSmall = ['description']
        return this.tableColumns.map(el => el.name).filter(el => that.showList || removeOnSmall.indexOf(el) === -1)
      },
    },
    mounted () {
      this.refresh()
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
            format: el => typeof el === 'string' && el.length > 50 ? el.slice(0, 50) + '...' : el,
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
    },
  }
</script>

<style lang="styl" type="text/stylus" scoped>
  .animateMaxWidth
    transition: max-width .5s ease-in-out

  .grow-fade-enter-active
    transition: all .5s ease-in-out

  .grow-fade-leave-active
    transition: all .5s ease-in-out

  .grow-fade-enter, .grow-fade-leave-to
    max-width: 0
    opacity: 0

</style>
