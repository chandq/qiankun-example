//强调：初次运行项目，需要首先yarn dll剥离出dll文件,为了在整个开发周期中提高打包速度，推荐隔段时间就yarn dll 剥离第三方库dll。

const { merge } = require('webpack-merge')
const webpackConfigBase = require('./webpack.base')
const env = require('./process.env.config')
const { name } = require('../package.json');

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 向dist文件中自动添加模版html,不生成dist目录
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin') //将打包生产的dll.js文件自动引入html
const fs = require('fs') //fs文件读取
const chalk = require('chalk')
// const WebpackBar = require('webpackbar') // webpack打包进度条
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //想要分开打包我们的css文件，需要使用mini-css-extract-plugin这个插件，
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

// const HappyPack = require('happypack')
// 创建一个 HappyThreadPool，作为所有 loader 共用的线程池(默认三个)
// const happyThreadPool = HappyPack.ThreadPool({ size: 5 })

process.env.PUBLIC_URL = env.publicPath

const plugins = [
  //插件
  // new HappyPack({
  //   /*
  //    * 必须配置
  //    */
  //   // id 标识符，要和 rules 中指定的 id 对应起来
  //   id: 'babel',
  //   // 需要使用的 loader，用法和 rules 中 Loader 配置一样
  //   // 可以直接是字符串，也可以是对象形式
  //   loaders: ['babel-loader?cacheDirectory'],
  //   threadPool: happyThreadPool
  // }),
  // webpack5的新特性联邦模块, 可共享公共依赖
  new ModuleFederationPlugin({
    name: `webpackJsonp_${name}`,
    // remotes: {
    //   app_two: "app_two_remote",
    //   app_three: "app_three_remote"
    // },
    exposes: {
      AppContainer: "./src/index"
    }
    // shared: ["react", "react-dom", "react-router-dom"]
  }),
  new HtmlWebpackPlugin({
    // 向dist文件中自动添加模版html,不生成dist目录
    template: 'public/index.html',
    favicon: 'public/favicon.ico'
  }),
  new webpack.DefinePlugin({
    'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL)
  }),
  // new webpack.NamedModulesPlugin(), //用于启动HMR时可以显示模块的相对路径
  new webpack.HotModuleReplacementPlugin(), // 开启模块热更新，热加载和模块热更新不同，热加载是整个页面刷新
  // new webpack.optimize.ModuleConcatenationPlugin(), // 运行 tree shaking 需要 ModuleConcatenationPlugin。
  //通过 mode: "production" 可以添加此插件。如果你是开发环境就需要手动添加
  // new WebpackBar(), // webpack打包进度条
  // new ProgressBarPlugin({
  //   format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
  //   clear: false
  // }),
  // new SpeedMeasurePlugin(),
  new MiniCssExtractPlugin({
    filename: 'main.css'
  })
]

const files = fs.readdirSync(path.resolve(__dirname, '../dll'))

// files.forEach(file => {
//   if (/.*\.dll.js/.test(file)) {
//     plugins.push(
//       new AddAssetHtmlWebpackPlugin({
//         filepath: path.resolve(__dirname, '../dll', file)
//       })
//     )
//   }
//   if (/.*\.manifest.json/.test(file)) {
//     plugins.push(
//       new webpack.DllReferencePlugin({
//         manifest: path.resolve(__dirname, '../dll', file)
//       })
//     )
//   }
// })

if (process.env.NODE_ENV === 'ana') {
  plugins.push(new BundleAnalyzerPlugin())
}

const webpackConfigDev = {
  mode: 'development', //模式,表示dev环境
  devtool: 'eval-cheap-module-source-map', // 开发环境配置最佳实践
  //devtool译为webpack的调试模式，可以配置sourceMap
  //sourceMap本质上是一种映射关系，打包出来的js文件中的代码可以映射到代码文件的具体位置,这种映射关系会帮助我们直接找到在源代码中的错误。
  //可以直接在devtool中使用.合理的使用source-map可以帮助我们提高开发效率，更快的定位到错误位置。生产环境和开发环境的devtool配置是不同的。
  //我们可以在webpack.dev.js中添加devtool。
  entry: {
    //入口
    //实现刷新浏览器webpack-hot-middleware/client?noInfo=true&reload=true 是必填的
    // main: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/index.js'],
    index: './src/index.js'
  },

  plugins, //plugins被DellPlugin后

  module: {
    rules: [
      {
        test: /\.css$/, //寻找css文件
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
        //use: ['style-loader', 'css-loader', 'postcss-loader'] //不提取时使用这种方式
      }
    ]
  },
  optimization: {
    // 开发环境时使用
    usedExports: true
  },
  devServer: {
    //自建dev服务环境,依赖webpack-dev-server，WDS不输出文件，只是放在内存中，因此速度更快。WDS只能用在dev环境
    contentBase: path.join(__dirname, '../dist'),
    port: 7799,
    historyApiFallback: true //配置historyApiFallback,使用BrowserRouter时可以解析路径,使用HashRouter无需配置
    //若采用自建服务实现HMR，我们可以使用connect-history-api-fallback来实现和historyApiFallback相同的功能。
  },
  output: {
    // 把子应用打包成 umd 库格式
    library: `${name}-[name]`,
    libraryTarget: 'umd',
    // jsonpFunction: `webpackJsonp_${name}`,
    libraryExport: `webpackJsonp_${name}`,
    // importFunctionName: `webpackJsonp_${name}`,
    publicPath: '/', //静态根路径 采用自建服务实现HMR需定义publicPath
    filename: '[name].js', //打包后输出的文件名称 //'[name].js'此方式是使用了webpack.HashedModuleIdsPlugin（生产环境）插件后的引用方式
    chunkFilename: '[name].js',
    path:  path.resolve(__dirname, '../dist')
  }
}

module.exports = merge(webpackConfigBase, webpackConfigDev)
