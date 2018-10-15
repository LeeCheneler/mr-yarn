#! /usr/bin/env node

const { resolve } = require('path')
const { run } = require('../.build/run')

run('package.json', process.cwd())
