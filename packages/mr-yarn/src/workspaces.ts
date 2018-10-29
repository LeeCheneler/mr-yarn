import { readJson } from 'fs-extra'
import * as glob from 'glob-promise'
import { resolve } from 'path'
import { defaultLogger } from './logger'
const semverRegex: () => RegExp = require('semver-regex') // tslint:disable-line

export interface IWorkspace {
  __workspaceConfigFilepath: string
  __workspaceDir: string
  name: string
  version: string
  scripts?: { [s: string]: string | undefined }
}

/**
 * Load workspaces based on mono repo config.
 * Also validates mono repo's config once it has read it.
 * @param cwd Directory to search for mono repo's config file
 * @param configFilename Mono repo config file name (eg. package.json)
 */
export const loadWorkspaces = async (cwd: string, configFilename: string): Promise<IWorkspace[]> => {
  let config

  /**
   * Load mono repo's config
   */
  try {
    config = await readJson(resolve(cwd, configFilename))
  } catch (error) {
    defaultLogger.error(error)
    throw new Error(
      `Unable to locate '${resolve(
        cwd,
        configFilename
      )}'. Ensure you run this tool in the same directory as the '${configFilename}' containing Yarn Workspaces config.`
    )
  }

  /**
   * Validate mono repos config
   */
  if (!Array.isArray(config.workspaces)) {
    throw new Error(`Missing {"workspaces": []} in '${configFilename}'`)
  }

  if (config.workspaces.length === 0) {
    throw new Error(`{"workspaces": []} in '${configFilename}' is an empty array`)
  }

  if (config.private !== true) {
    throw new Error(`Missing { "private": true } in '${configFilename}'`)
  }

  /**
   * Load each workspace's config
   */
  const workspaceConfigGlobs = (config.workspaces as string[]).map(g => resolve(cwd, g, 'package.json'))
  const workspaceConfigFilepaths = (await Promise.all(workspaceConfigGlobs.map(g => glob(g)))).reduce(
    (acc, next) => [...acc, ...next],
    []
  )
  const workspaceConfigs: IWorkspace[] = await Promise.all(
    /**
     * Read and validate each workspaces config
     */
    workspaceConfigFilepaths.map(async filepath => {
      const workspaceConfig = await readJson(filepath)
      if (typeof workspaceConfig.name !== 'string' || workspaceConfig.name.length === 0) {
        throw new Error(`Workspace at '${filepath}' has an invalid name`)
      }

      if (!semverRegex().test(workspaceConfig.version)) {
        throw new Error(`Workspace '${workspaceConfig.name}' does not have a valid version`)
      }

      return {
        ...workspaceConfig,
        __workspaceConfigFilepath: filepath,
        __workspaceDir: filepath.replace('/package.json', '')
      }
    })
  )

  if (workspaceConfigs.length === 0) {
    throw new Error('Could not locate any workspaces')
  }

  return workspaceConfigs
}

/**
 * Load target workspaces according to filter string
 * @param workspacesFilter
 */
export const loadTargetWorkspaces = async (
  workspacesFilter: string | null,
  cwd: string,
  configFilename: string
): Promise<IWorkspace[]> => {
  /**
   * Load all workspaces in the mono repo
   */
  const monoRepoWorkspaces = await loadWorkspaces(cwd, configFilename)

  return workspacesFilter
    ? monoRepoWorkspaces.filter(workspace => {
        const filters = workspacesFilter.split(',')
        const matchedWildCard =
          filters
            .filter(f => f.includes('*'))
            .map(f => f.split('*')[0])
            .filter(f => workspace.name.startsWith(f)).length > 0
        return matchedWildCard || filters.includes(workspace.name)
      })
    : monoRepoWorkspaces
}
