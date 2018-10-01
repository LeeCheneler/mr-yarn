import { copy, move, readJson, remove } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../utils'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const fixturesDir = resolve(process.cwd(), 'src/__fixtures__')

/**
 * Create a temporary working directory
 */
const cwd = resolve(fixturesDir, 'remove-temp')

beforeEach(async () => {
    await copy(resolve(fixturesDir, 'clean'), cwd)
    /**
     * Clean mono repo doesn't contain a package.json because jest validates module names
     * and will log a warning if 2 match which they would following the first copy
     */
    await move(resolve(cwd, 'package.json.copyme'), resolve(cwd, 'package.json'))
})

afterEach(async () => {
    await remove(cwd)
})

describe('remove command', () => {
    it('should remove an existing dependency from all workspaces', async () => {
        await exec('mr add react@16.5.0 deep-freeze', { cwd })

        const { stdout } = await exec('mr remove react', { cwd })

        const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
        const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

        expect(workspaceOne.dependencies.react).toBe(undefined)
        expect(workspaceOne.dependencies['deep-freeze']).toBeTruthy()
        expect(workspaceTwo.dependencies.react).toBe(undefined)
        expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
        expect(stdout).toMatchSnapshot()
    })

    it('should remove an existing dependency from a specified workspace', async () => {
        await exec('mr add react@16.5.0', { cwd })

        const { stdout } = await exec('mr remove react -w workspace-one', { cwd })

        const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
        const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

        expect(workspaceOne.dependencies.react).toBe(undefined)
        expect(workspaceTwo.dependencies.react).toBe('16.5.0')
        expect(stdout).toMatchSnapshot()
    })

    it('should remove a dependency from all workspaces even when some dont contain it', async () => {
        await exec('mr add react@16.5.0 -w workspace-one', { cwd })

        const { stdout } = await exec('mr remove react', { cwd })

        const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
        const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

        expect(workspaceOne.dependencies.react).toBe(undefined)
        expect(workspaceTwo.dependencies).toBe(undefined)
        // expect(stdout).toMatchSnapshot() TODO: uncomment this snapshot when issue #16 is resolved
    })

    it('should remove multiple existing dependencies', async () => {
        await exec('mr add react@16.5.0 deep-freeze', { cwd })

        const { stdout } = await exec('mr remove react deep-freeze', { cwd })

        const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
        const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

        expect(workspaceOne.dependencies.react).toBe(undefined)
        expect(workspaceOne.dependencies['deep-freeze']).toBe(undefined)
        expect(workspaceTwo.dependencies.react).toBe(undefined)
        expect(workspaceTwo.dependencies['deep-freeze']).toBe(undefined)
        expect(stdout).toMatchSnapshot()
    })
})