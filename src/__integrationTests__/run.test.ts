import { copy, move, readJson, remove } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../testUtils'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const fixturesDir = resolve(process.cwd(), 'src/__integrationFixtures__')

/**
 * Create a bootstrap a temporary working directory
 */
const cwd = resolve(fixturesDir, 'run-temp')

beforeEach(async () => {
  await copy(resolve(fixturesDir, 'clean'), cwd)
  /**
   * Clean mono repo doesn't contain a packahe.json because jest validates module names
   * and will log a warning if 2 match which they would following the first copy
   */
  await move(resolve(cwd, 'package.json.copyme'), resolve(cwd, 'package.json'))
})

afterEach(async () => {
  await remove(cwd)
})

describe('run command', () => {
  it('should run the script in every workspace', async () => {
    const { stdout } = await exec('mr run hello', { cwd })

    expect(stdout.includes('hello from workspace-one')).toBe(true)
    expect(stdout.includes('hello from workspace-two')).toBe(true)
  })

  it('should forward args following --', async () => {
    const { stdout } = await exec('mr run world -- --switch world', { cwd })

    expect(stdout.split('yarn hello --switch world').length).toBe(3)
  })
})
