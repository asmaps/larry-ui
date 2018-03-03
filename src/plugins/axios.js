import axios from 'axios'

export default ({ Vue }) => {
  axios.defaults.headers.common['Accept'] = 'application/json'
  axios.defaults.baseURL = process.env.API
  Vue.prototype.$http = axios
}
