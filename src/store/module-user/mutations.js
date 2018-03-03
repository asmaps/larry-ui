import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { LocalStorage } from 'quasar'

export const setAuthToken = (state, { authToken }) => {
  state.authToken = authToken
  state.decodedToken = jwtDecode(authToken)
  axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  LocalStorage.set('authToken', authToken)
}

export const logout = (state) => {
  state.authToken = null
  state.decodedToken = {}
  delete axios.defaults.headers.common['Authorization']
  LocalStorage.remove('authToken')
}
