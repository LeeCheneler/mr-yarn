import { copy, move, readJson, remove } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../utils'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const fixturesDir = resolve(process.cwd(), 'src/__fixtures__')

/**
 * Create a bootstrap a temporary working directory
 */
const cwd = resolve(fixturesDir, 'add-temp')

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

describe('add command', () => {
  describe('validate packages to install', () => {
    it('should not perform an install if any packages are incorrectly formatted and should output invalid packages provided', async () => {
      const { stdout } = await exec('mr add deep-freeze react-dom@16.5.0 react@a16.5.0 excited! what:bad', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceOne.dependencies).toBe(undefined)
      expect(workspaceTwo.dependencies).toBe(undefined)
      expect(stdout).toMatchSnapshot()
    })
  })

  describe('npm packages', () => {
    it('should add dependencies to all workspaces', async () => {
      await exec('mr add deep-freeze', { cwd })
      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceOne.dependencies['deep-freeze']).toBeTruthy()
      expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
    })

    it('should add dev dependencies to all workspaces', async () => {
      await exec('mr add --dev deep-freeze', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceOne.devDependencies['deep-freeze']).toBeTruthy()
      expect(workspaceTwo.devDependencies['deep-freeze']).toBeTruthy()
    })

    it('should add dependencies to filtered workspaces', async () => {
      await exec('mr add deep-freeze --workspaces workspace-two', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceOne.dependencies).toBe(undefined)
      expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
    })
  })

  describe('workspace packages', () => {
    it('should add workspaces as dependencies to all workspaces but themselves', async () => {
      await exec('mr add workspace-one', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceOne.dependencies).toBe(undefined)
      expect(workspaceTwo.dependencies['workspace-one']).toBeTruthy()
    })

    it('should add workspaces as dev dependencies to all workspaces but themselves', async () => {
      await exec('mr add --dev workspace-one', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceOne.devDependencies).toBe(undefined)
      expect(workspaceTwo.devDependencies['workspace-one']).toBeTruthy()
    })

    it('should add workspaces as dependencies to filtered workspaces', async () => {
      await exec('mr add --workspaces workspace-two workspace-one', { cwd })
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

      expect(workspaceTwo.dependencies['workspace-one']).toBeTruthy()
    })
  })

  describe('adding existing packages', () => {
    it('should update a package version', async () => {
      await exec('mr add -w workspace-one react@15.4.1 ', { cwd })
      await exec('mr add -w workspace-one react@16.5.0', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))

      expect(workspaceOne.dependencies.react).toBe('16.5.0')
    })
  })
})
