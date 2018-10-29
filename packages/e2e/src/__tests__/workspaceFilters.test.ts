import { readJson } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../utils/exec'
import { withMonoRepoFixture } from '../utils/fixtures'

const { cwd } = withMonoRepoFixture('workspace-filter-mono-repo-fixture')

describe('workspace filter switch', () => {
  it('should match a single workspace', async () => {
    await exec('mr add deep-freeze --workspaces workspace-two', { cwd })

    const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
    const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))
    const workspaceThree = await readJson(resolve(cwd, 'workspaces/workspace-three/package.json'))

    expect(workspaceOne.dependencies).toBe(undefined)
    expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
    expect(workspaceThree.dependencies).toBe(undefined)
  })

  it('should match multiple comma seperated workspaces', async () => {
    await exec('mr add deep-freeze --workspaces workspace-one,workspace-two', { cwd })

    const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
    const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))
    const workspaceThree = await readJson(resolve(cwd, 'workspaces/workspace-three/package.json'))

    expect(workspaceOne.dependencies['deep-freeze']).toBeTruthy()
    expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
    expect(workspaceThree.dependencies).toBe(undefined)
  })

  it('should match workspaces matching the wildcard', async () => {
    await exec('mr add deep-freeze --workspaces workspace-t*', { cwd })

    const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
    const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))
    const workspaceThree = await readJson(resolve(cwd, 'workspaces/workspace-three/package.json'))

    expect(workspaceOne.dependencies).toBe(undefined)
    expect(workspaceTwo.dependencies['deep-freeze']).toBeTruthy()
    expect(workspaceThree.dependencies['deep-freeze']).toBeTruthy()
  })
})
