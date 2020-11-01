import '@/utils/global'

// window.basename = process.env.PUBLIC_URL.slice(0, -1)

if (process.env.NODE_ENV === 'production') {
  window.basename = process.env.PUBLIC_URL.slice(0, -1)
} else {
  window.basename = '/sub-react17-webpack5'
}
