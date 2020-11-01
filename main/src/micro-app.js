import store from './store'

const microApps = [
  {
    name: 'sub-vue',
    entry: process.env.VUE_APP_SUB_VUE,
    activeRule: '/sub-vue'
  },
  {
    name: 'sub-react',
    entry: process.env.VUE_APP_SUB_REACT,
    activeRule: '/sub-react'
  },
  {
    name: 'sub-react16-webpack4',
    entry: process.env.VUE_APP_SUB_REACT16_WEBPACK4,
    activeRule: '/sub-react16-webpack4'
  },
  {
    name: 'sub-react17-webpack5',
    entry: process.env.VUE_APP_SUB_REACT17_WEBPACK5,
    activeRule: '/sub-react17-webpack5'
  }
]

const apps = microApps.map(item => {
  return {
    ...item,
    container: '#subapp-viewport', // 子应用挂载的div
    props: {
      routerBase: item.activeRule, // 下发基础路由
      getGlobalState: store.getGlobalState // 下发getGlobalState方法
    }
  }
})

export default apps
