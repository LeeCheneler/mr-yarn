#! /usr/bin/env node

const { resolve } = require('path')
const { run } = require('../.build/run')

run({ configFilename: 'package.json', cwd: process.cwd() })
