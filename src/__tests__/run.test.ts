import { resolve } from 'path'
import { run } from '../run'

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

describe('run', () => {
  it('should reject invalid yarn workspaces config', async () => {
    await run({ workspacesConfigFilePath: resolve(__dirname, '../__fixtures__/invalidPackage.json') })

    expect(global.console.log).toHaveBeenCalledTimes(1)
    expect(global.console.log).toHaveBeenCalledWith(expect.stringContaining('error'))
  })

  it('should run without errors', async () => {
    await run({ workspacesConfigFilePath: resolve(__dirname, '../__fixtures__/validPackage.json') })

    expect(global.console.log).not.toHaveBeenCalledWith(expect.stringContaining('error'))
  })
})
