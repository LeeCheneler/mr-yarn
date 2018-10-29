import { copy, move, remove } from 'fs-extra'
import { resolve } from 'path'

export const withMonoRepoFixture = (fixtureDirname: string) => {
  /**
   * Fixtures directory containing variants of workspace setup to assert against
   */
  const fixturesDir = resolve(process.cwd(), 'src/__fixtures__')

  /**
   * Create a temporary working directory
   */
  const cwd = resolve(fixturesDir, fixtureDirname)

  beforeEach(async () => {
    await remove(cwd)
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

  return { cwd }
}
