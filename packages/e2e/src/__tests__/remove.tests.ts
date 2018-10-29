import { copy, move, readJson, remove } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../utils/exec'
import { withMonoRepoFixture } from '../utils/fixtures'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const { cwd } = withMonoRepoFixture('remove-mono-repo-fixture')

describe('remove command', () => {
  it('should remove an existing dependency from all workspaces', async () => {
    await exec('mr add react@16.5.0 deep-freeze', { cwd })

    await exec('mr remove react', { cwd })

    const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
    const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

    expect(workspaceOne.dependencies.react).toBe(undefined)
    expect(workspaceOne.dependencies['deep-freeze']).toBeTruthy()
    expect(workspaceTwo.dependencies.react).toBe(undefined)
    expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
  })

  it('should remove a dependency from all workspaces even when some dont contain it', async () => {
    await exec('mr add react@16.5.0 -w workspace-one', { cwd })

    await exec('mr remove react', { cwd })

    const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
    const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

    expect(workspaceOne.dependencies.react).toBe(undefined)
    expect(workspaceTwo.dependencies).toBe(undefined)
  })

  it('should remove multiple existing dependencies', async () => {
    await exec('mr add react@16.5.0 deep-freeze', { cwd })

    await exec('mr remove react deep-freeze', { cwd })

    const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
    const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))

    expect(workspaceOne.dependencies.react).toBe(undefined)
    expect(workspaceOne.dependencies['deep-freeze']).toBe(undefined)
    expect(workspaceTwo.dependencies.react).toBe(undefined)
    expect(workspaceTwo.dependencies['deep-freeze']).toBe(undefined)
  })
})
