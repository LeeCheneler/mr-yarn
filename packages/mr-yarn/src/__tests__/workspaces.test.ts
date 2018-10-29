import { resolve } from 'path'
import { loadTargetWorkspaces, loadWorkspaces } from '../workspaces'

/**
 * Fixtures directory containing variants of workspace setup to assert against
 */
const fixturesDir = resolve(process.cwd(), 'src/__fixtures__')

describe('loadWorkspaces', () => {
  it('should return configs of all workspaces in monorepo', async () => {
    const workspaces = await loadWorkspaces(fixturesDir, 'valid.json')

    expect(workspaces).toMatchObject([
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-one/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-one'),
        name: 'workspace-one',
        scripts: {
          test: 'echo test-one'
        },
        version: '1.0.0'
      },
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-two/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-two'),
        name: 'workspace-two',
        scripts: {
          test: 'echo test-two'
        },
        version: '1.0.0'
      }
    ])
  })

  it('should throw if the config file can not be found', async () => {
    await expect(loadWorkspaces(fixturesDir, 'notfound.json')).rejects.toEqual(
      new Error(
        `Unable to locate '${fixturesDir}/notfound.json'. Ensure you run this tool in the same directory as the 'notfound.json' containing Yarn Workspaces config.`
      )
    )
  })

  it('should throw if the mono repo is a public package', async () => {
    await expect(loadWorkspaces(fixturesDir, 'public.json')).rejects.toEqual(
      new Error(`Missing { "private": true } in 'public.json'`)
    )
  })

  it('should throw if the mono repo config has no array of workspace globs', async () => {
    await expect(loadWorkspaces(fixturesDir, 'noWorkspacesConfig.json')).rejects.toEqual(
      new Error(`Missing {"workspaces": []} in 'noWorkspacesConfig.json'`)
    )
  })

  it('should throw if the mono repo config has an empty array of workspace globs', async () => {
    await expect(loadWorkspaces(fixturesDir, 'emptyWorkspaces.json')).rejects.toEqual(
      new Error(`{"workspaces": []} in 'emptyWorkspaces.json' is an empty array`)
    )
  })

  it('should throw a workspace has an invalid name', async () => {
    await expect(loadWorkspaces(fixturesDir, 'invalidNameWorkspaces.json')).rejects.toEqual(
      new Error(`Workspace at '${fixturesDir}/invalidNameWorkspaces/workspace-one/package.json' has an invalid name`)
    )
  })

  it('should throw a workspace has an invalid version', async () => {
    await expect(loadWorkspaces(fixturesDir, 'invalidVersionWorkspaces.json')).rejects.toEqual(
      new Error(`Workspace 'workspace-one' does not have a valid version`)
    )
  })

  it('should throw if no workspaces are found', async () => {
    await expect(loadWorkspaces(fixturesDir, 'noWorkspaces.json')).rejects.toEqual(
      new Error(`Could not locate any workspaces`)
    )
  })
})

describe('loadTargetWorkspaces', () => {
  it('should return configs of all workspaces in monorepo when no filter string is provided', async () => {
    const workspaces = await loadTargetWorkspaces(null, fixturesDir, 'valid.json')

    expect(workspaces).toMatchObject([
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-one/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-one'),
        name: 'workspace-one',
        scripts: {
          test: 'echo test-one'
        },
        version: '1.0.0'
      },
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-two/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-two'),
        name: 'workspace-two',
        scripts: {
          test: 'echo test-two'
        },
        version: '1.0.0'
      }
    ])
  })

  it('should return config of a single workspace', async () => {
    const workspaces = await loadTargetWorkspaces('workspace-one', fixturesDir, 'valid.json')

    expect(workspaces).toMatchObject([
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-one/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-one'),
        name: 'workspace-one',
        scripts: {
          test: 'echo test-one'
        },
        version: '1.0.0'
      }
    ])
  })

  it('should return config of comma seperated workspaces', async () => {
    const workspaces = await loadTargetWorkspaces('workspace-one,workspace-two', fixturesDir, 'valid.json')

    expect(workspaces).toMatchObject([
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-one/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-one'),
        name: 'workspace-one',
        scripts: {
          test: 'echo test-one'
        },
        version: '1.0.0'
      },
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-two/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-two'),
        name: 'workspace-two',
        scripts: {
          test: 'echo test-two'
        },
        version: '1.0.0'
      }
    ])
  })

  it('should return configs of workspaces according to filter string using wildcard', async () => {
    const workspaces = await loadTargetWorkspaces('workspace-o*', fixturesDir, 'valid.json')

    expect(workspaces).toMatchObject([
      {
        __workspaceConfigFilepath: resolve(fixturesDir, 'valid/workspace-one/package.json'),
        __workspaceDir: resolve(fixturesDir, 'valid/workspace-one'),
        name: 'workspace-one',
        scripts: {
          test: 'echo test-one'
        },
        version: '1.0.0'
      }
    ])
  })
})
