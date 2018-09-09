import { resolve } from 'path'
import { exec } from '../testUtils'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const fixturesDir = resolve(process.cwd(), 'src/__integrationFixtures__')
const cwd = resolve(fixturesDir, 'valid')

it('Should print version', async () => {
  const { stdout } = await exec('mr --version', { cwd })

  expect(stdout).toMatchSnapshot()
})

it('Should print help', async () => {
  const { stdout } = await exec('mr --help', { cwd })

  expect(stdout).toMatchSnapshot()
})
