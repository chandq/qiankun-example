
import './public-path'
import React from 'react';
import ReactDOM from 'react-dom';
import dva from 'dva'
import { createBrowserHistory } from 'history' //使用history路由模式
// import qhistory from 'qhistory'
import '@/utils/config'
import { stringify, parse } from 'qs' //qs是npm仓库所管理的包,qs.stringify()作用是将对象或者数组序列化成URL的格式。
//具体参照https://www.jianshu.com/p/7e64878fb210
import '@/styles/index.css'
import '@/utils/setrem'

//1.Initialize
const app = dva({
  history: createBrowserHistory(),
  onStateChange: (...arg) => {
    // console.log('onStateChange', arg)
  }
})

//app.use();

//2.Model
/**component model 如果有*/

/**page model */
app.model(require('./layout/Login/model').default)
app.model(require('./layout/Index/model').default)

//3.Router
app.router(require('./router/index').default)

function render() {
  //4.Start
  app.start('#root')
  console.log('webpack4-render: ', app)
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}
/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('react app bootstraped');
}
/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  console.log('react16-webpack4: ', props);
  render();
}
/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
  ReactDOM.unmountComponentAtNode(document.getElementById('root'));
}
/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props) {
  console.log('update props', props);
}
