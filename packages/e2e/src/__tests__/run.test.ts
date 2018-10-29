import { copy, move, remove } from 'fs-extra'
import { resolve } from 'path'
import { exec } from '../utils/exec'
import { withMonoRepoFixture } from '../utils/fixtures'

const { cwd } = withMonoRepoFixture('run-mono-repo-fixture')

describe('run command', () => {
  it('should run the script in every workspace', async () => {
    const { stdout } = await exec('mr run hello', { cwd })

    expect(stdout.includes('hello from workspace-one')).toBe(true)
    expect(stdout.includes('hello from workspace-two')).toBe(true)
    expect(stdout.includes('hello from workspace-three')).toBe(true)
  })

  it('should forward args following --', async () => {
    const { stdout } = await exec('mr run world -- --switch world', { cwd })

    const matches = stdout.match(/yarn hello --switch world/g) || []

    expect(matches.length).toBe(3)
  })

  it('should exit with code 1 if script exits with non-zero exit code', async () => {
    expect.assertions(1)
    try {
      await exec('mr run -w workspace-one fail', { cwd })
    } catch ({ code }) {
      expect(code).toBe(1)
    }
  })

  it('should only attempt to run a script if it exists in a workspace', async () => {
    const { stdout } = await exec('mr run script-in-workspace-one-workspace-two', { cwd })

    expect(stdout.includes('run-workspace-one')).toBe(true)
    expect(stdout.includes('run-workspace-two')).toBe(true)
  })

  it('should complete execution of all scripts even if some fail', async () => {
    expect.assertions(3)

    try {
      await exec('mr run sleep-or-fail', { cwd })
    } catch ({ stdout, code }) {
      expect(stdout.includes(': run-workspace-two')).toBe(true)
      expect(stdout.includes(': run-workspace-three')).toBe(true)
      expect(code).toBe(1)
    }
  })

  it('should run all scripts matching wildcard', async () => {
    const { stdout } = await exec('mr run wildcard:*', { cwd })

    expect(stdout.includes('hello from wildcard:one')).toBe(true)
    expect(stdout.includes('hello from wildcard:two')).toBe(true)
  })
})
