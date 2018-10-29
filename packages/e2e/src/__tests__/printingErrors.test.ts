import { resolve } from 'path'
import { exec } from '../utils/exec'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const fixturesDir = resolve(process.cwd(), 'src/__fixtures__')

it('Errors thrown by mr yarn should be piped stdout', async () => {
  const { stdout } = await exec('mr add deep-freeze', { cwd: resolve(fixturesDir, 'invalid') })

  expect(stdout.includes(`Missing { "private": true } in 'package.json'`)).toBeTruthy()
})
