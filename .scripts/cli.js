#! /usr/bin/env node

const { resolve } = require('path')
const { run } = require('../.build/run')

run({ workspacesConfigFilePath: resolve(process.cwd(), 'package.json') })
