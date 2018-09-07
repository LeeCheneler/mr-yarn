import 'colors'
import { config } from '../config'
import { createLogger, defaultLogger } from '../logger'

const ogConsole = global.console

beforeEach(() => {
  global.console = {
    ...global.console,
    error: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn()
  }
})

afterEach(() => {
  global.console = ogConsole
})

describe('defaultLogger', () => {
  it('should log', () => {
    defaultLogger.log('info', 'test')

    expect(global.console.log).toHaveBeenCalledTimes(1)
    expect(global.console.log).toHaveBeenCalledWith(`${config.defaultPrefix} ${'info'.green}: test`)
  })

  it('should log info', () => {
    defaultLogger.info('test')

    expect(global.console.log).toHaveBeenCalledTimes(1)
    expect(global.console.log).toHaveBeenCalledWith(`${config.defaultPrefix} ${'info'.green}: test`)
  })

  it('should log errors', () => {
    defaultLogger.error('test')

    expect(global.console.log).toHaveBeenCalledTimes(1)
    expect(global.console.log).toHaveBeenCalledWith(`${config.defaultPrefix} ${'error'.red}: test`)
  })

  it('should log warnings', () => {
    defaultLogger.warn('test')

    expect(global.console.log).toHaveBeenCalledTimes(1)
    expect(global.console.log).toHaveBeenCalledWith(`${config.defaultPrefix} ${'warn'.yellow}: test`)
  })
})

describe('createLogger', () => {
  it('should return a logger', () => {
    const options = {
      prefix: 'prefix'.grey
    }
    createLogger(options).info('test')

    expect(global.console.log).toHaveBeenCalledTimes(1)
    expect(global.console.log).toHaveBeenCalledWith(`${options.prefix} ${'info'.green}: test`)
  })
})
