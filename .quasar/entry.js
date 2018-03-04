/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding initialization code.
 * Use "quasar new plugin <name>" and add it there.
 * One plugin per concern. Then reference the file(s) in quasar.conf.js > plugins:
 * plugins: ['file', ...] // do not add ".js" extension to it.
 **/



import 'quasar-framework/dist/quasar.ie.polyfills'



import 'quasar-extras/roboto-font'

import 'quasar-extras/fontawesome'



import 'quasar-extras/animate/fadeIn.css'

import 'quasar-extras/animate/fadeOut.css'

import 'quasar-extras/animate/fadeInLeft.css'

import 'quasar-extras/animate/fadeInRight.css'

import 'quasar-extras/animate/fadeOutLeft.css'

import 'quasar-extras/animate/fadeOutRight.css'


import 'quasar-app-styl'


import 'src/css/app.styl'


import Vue from 'vue'
import Quasar, {QAlert,QLayout,QLayoutHeader,QLayoutDrawer,QPageContainer,QPage,QToolbar,QToolbarTitle,QBtn,QIcon,QList,QListHeader,QInput,QItem,QItemMain,QItemSide,QTable,QTabs,QRouteTab,QInnerLoading,QSpinnerComment,QField,QStep,QStepper,QStepperNavigation,QTd,QSpinner,QCard,QCardTitle,QCardMain,QCardMedia,QCardSeparator,QCardActions,QParallax,QCheckbox,QChip,QChatMessage,Ripple,LocalStorage,Dialog,Notify} from 'quasar'

Vue.config.productionTip = false
import App from 'src/App'

Vue.use(Quasar, {components: {QAlert,QLayout,QLayoutHeader,QLayoutDrawer,QPageContainer,QPage,QToolbar,QToolbarTitle,QBtn,QIcon,QList,QListHeader,QInput,QItem,QItemMain,QItemSide,QTable,QTabs,QRouteTab,QInnerLoading,QSpinnerComment,QField,QStep,QStepper,QStepperNavigation,QTd,QSpinner,QCard,QCardTitle,QCardMain,QCardMedia,QCardSeparator,QCardActions,QParallax,QCheckbox,QChip,QChatMessage},directives: {Ripple},plugins: {LocalStorage,Dialog,Notify}})



import iconSet from 'quasar-framework/icons/fontawesome'
Quasar.icons.set(iconSet)


import router from 'src/router'

import store from 'src/store'


const app = {
  el: '#q-app',
  router,
store,
  ...App
}


const plugins = []

import pluginI18n from 'src/plugins/i18n'
plugins.push(pluginI18n)

import pluginAxios from 'src/plugins/axios'
plugins.push(pluginAxios)

import pluginPrettyBytes from 'src/plugins/prettyBytes'
plugins.push(pluginPrettyBytes)

import pluginVueMoment from 'src/plugins/vueMoment'
plugins.push(pluginVueMoment)

plugins.forEach(plugin => plugin({ app, router, store, Vue }))








/* eslint-disable no-new */
new Vue(app)


