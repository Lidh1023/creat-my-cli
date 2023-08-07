#!/usr/bin/env node
//在入口文件顶层声明文件执行方式为node

//引入依赖：用于自定义命令行指令，定义与用户的最基本的交互命令
const program = require('commander')

//定义当前版本
//定义使用方法
//定义四个指令
program
  .version(require('../package').version)
  .usage('<command> [options]')
  .command('add','add a new template')
  .command('delete','delete a template')
  .command('list','list all the templates')
  .command('init','generate a new project form a template')

//解析命令行参数：用process.argv用来解析node的参数
program.parse(process.argv)