import { readJson } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../utils/exec'
import { withMonoRepoFixture } from '../utils/fixtures'

const { cwd } = withMonoRepoFixture('add-mono-repo-fixture')

describe('add command', () => {
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

    it('should not add workspaces as dependency to workspaces not matching filter', async () => {
      await exec('mr add --workspaces workspace-three workspace-one', { cwd })

      const workspaceOne = await readJson(resolve(cwd, 'workspaces/workspace-one/package.json'))
      const workspaceTwo = await readJson(resolve(cwd, 'workspaces/workspace-two/package.json'))
      const workspaceThree = await readJson(resolve(cwd, 'workspaces/workspace-three/package.json'))

      expect(workspaceOne.dependencies).toBe(undefined)
      expect(workspaceTwo.dependencies).toBe(undefined)
      expect(workspaceThree.dependencies['workspace-one']).toBe('1.0.0')
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
