export const setAuthToken = (token) => {
  localStorage.setItem('admin_token', token)
}

export const getAuthToken = () => {
  return localStorage.getItem('admin_token')
}

export const removeAuthToken = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
}

export const setUser = (user) => {
  localStorage.setItem('admin_user', JSON.stringify(user))
}

export const getUser = () => {
  const user = localStorage.getItem('admin_user')
  return user ? JSON.parse(user) : null
}

export const isAdmin = () => {
  const user = getUser()
  return user && user.role === 'admin'
}

export const isAuthenticated = () => {
  return !!getAuthToken() && isAdmin()
}

