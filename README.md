# creat-my-cli
# -creat-my-cli
## 创建一个脚手架

### process.env环境变量

#### process.env环境变量配置
1、process 对象是一个全局变量，提供了有关当前 Node.js 进程的信息并对其进行控制
2、process.env 属性会返回包含用户环境的对象

##### 为什么需要环境变量

1、版本差异
  一个项目从开发到上线一般都会经历三个过程，从开发版本到测试版本到生产版本。每个版本都有对应的相同的或者不同的后端数据库、api地址、前端编译环境。用于区分不同环境作用，拿前端编译环境来说，开发环境需要启动热更新、不需要启动代码压缩混淆；生产版本不需要启动热更新，需要启动代码压缩混淆。

2、请求前缀
  日常开发过程，都会封装请求方法类，其他模块直接调用请求方法类传递请求头、请求参数等即可发送http请求。
  然而真实的开发过程每个版本都会对应一个不同的请求地址。

3、其他
  系统基础信息
  系统访问异常返回信息
  其他在不同环境上单独配置的信息

#### 原理
采用nodejs顶层对象中process基础类下process.env属性，返回包含用户环境的对象。根据各个环境的配置文件区分和控制

##### node环境变量
node环境变量指nodejs执行环境的环境变量,此处的nodejs指的是webpack的编译环境,通过npm script中的set属性设置
```js
  //package.json
"scripts": {
    "dev": "set NODE_ENV=develop &&  set PORT=8085 && webpack-dev-server --inline --progress  --config  build/webpack.dev.conf.js ",
    "build": "node build/build.js"
  },
```
在webpack编译过程中获取
```js
  //webpack.dev.conf.js
  const PORT = process.env.PORT && Number(process.env.PORT)
  console.log(process.env.NODE_ENV,process.env.PORT)
  // develop 8085
```
##### 客户端环境变量
客户端环境变量指在本地运行的代码中获取到的环境变量,通过webpack插件DefinePlugin 配置
```js
  //webpack.dev.conf.js
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    })
  ]
```
```js
  //dev.env.js
  'use strict'
  const merge = require('webpack-merge')
  module.exports = merge({
    NODE_ENV: '"development"'
  })
```
本地运行代码获取
```js
  created() {
    console.log(process.env)
    //{NODE_ENV: "development"}
  }
```
客户端环境变量只能通过console.log()打印，断点无法获取变量值

### 从0开始写一个前端脚手架

#### 1、脚手架的初始化

新建文件夹 执行：
```js
  npm init -y
```
会出现以下情况

｜名称｜意思｜默认值｜
｜----｜----｜
｜package｜name包的名称｜创建文件夹时的名称｜
｜version	｜版本号｜1.0.0｜
｜description	｜包的描述｜创建文件时的名称｜
｜entry point｜入口文件｜index.js｜
｜test ｜command｜测试命令｜—｜
｜git repository｜git仓库地址｜—｜
｜keywords｜关键词，上传到npm官网时在页面中展示的关键词｜—｜
｜author｜作者信息，对象的形式，里面存储一些邮箱、作者名、url｜	—｜
｜license｜执照｜MIT|

回答完这些后就会生成一个 package.json 的文件

#### 2、脚手架依赖安装
npm i path
npm i chalk@4.1.0
npm i fs-extra
npm i inquirer@8.2.4
npm i commander
npm i axios
npm i download-git-repo

#### 3、询问用户问题

##### 创建入口文件
在询问问题前我们需要先创建一个入口文件，创建完成后在package.json中添加bin项，并且将入口文件路径写进去
![Alt text](image.png)

填写完入口文件路径后在入口文件内随便输出一句， 但必须在入口文件顶层声明文件执行方式为node
```js
  //声明代码：
  #! /usr/bin/env node
```
![Alt text](image-1.png)

写完后需要测试一下是否可以正常的访问的脚手架,在本文件夹打开命令行，输入 npm link,该命令会创建一个全局访问的包的快捷方式,这个是临时的就是本地测试的时候用的，这个在命令行输入你的脚手架的名称可以看到入口文件输出的内容
![Alt text](image-2.png)
![Alt text](image-3.png)

##### 最基本的交互命令
需要用到一个用于自定义命令行指令的依赖 commander 与用户进行交互

引入依赖:
```js
  const program = require('commander')
```

简单介绍一下commander依赖常用的方法:
**command 命令**
.command()的第一个参数为命令名称;
命令参数可以跟在名称后面，也可以用.argument()单独指定;参数可为必选的（尖括号表示）、可选的（方括号表示）或变长参数（点号表示，如果使用，只能是最后一个参数）。
```js
  // 创建一个create命令
  .command('create <app-name>')
```

**parse 解析**
.parse()的第一个参数是要解析的字符串数组；
也可以省略参数而使用process.argv，这里我们也是用process.argv用来解析node的参数。
```js
  // 解析用户执行命令传入参数
  program.parse(process.argv);
```

**option 选项**
.option()可以附加选项的简介;
第一个参数可以定义一个短选项名称（-后面接单个字符）和一个长选项名称（–后面接一个或多个单词），使用逗号、空格或|分隔。第二个参数为该选项的简介。
```js
  .option('-f, --force', '如果存在的话强行覆盖')
```

**action 处理函数**
.action(),用command创建的自定义命令的处理函数,action携带的实参顺序就是命令的参数的顺序;
```js
  program
  .command('create <app-name>')
  // 这个name 就代表第一个必填参数 options就代表其余， 如果有第二个就在写一个，最后一个永远是剩余参数
  .action((name, options) => {
      console.log(name)
      // 打印执行结果
      // require("../lib/create")(name, options)
  })
```

#### 4、编写交互命令 create
  入口文件
```js
  #! /usr/bin/env node
  const program = require('commander');
  const chalk = require('chalk');

  // 定义命令和参数
  // create命令
  program
  .command('create <app-name>')
  .description('create a new project')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', 'overwrite target directory if it exist')
  .action((name, options) => {
      // 打印执行结果
      console.log('项目名称', name)
  })

  // 解析用户执行命令传入参数
  program.parse(process.argv);
```

这里创建了一个叫 create 的自定义指令，这个命令有着必填的项目名、可以选择的强制覆盖的选项 -f，有着处理函数action;
在action中接收并打印了用户输入的项目名称;
接下来再次运行脚手架并带上create命令，我的叫test;
出现如下就说明第一个命令创建成功了;
![Alt text](image-4.png)
**注意: 解析用户命令参数的操作一定要在最后一行否则什么都不会出现**
```js
  program.parse(process.argv);
```

到这里为止成功为脚手架创建了第一个交互命令!

