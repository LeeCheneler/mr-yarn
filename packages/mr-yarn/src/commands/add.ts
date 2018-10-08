import { readJson, writeJson } from 'fs-extra'
import { resolve } from 'path'
import { Argv } from 'yargs'
import { exec } from '../exec'
import { defaultLogger } from '../logger'
import { findWorkspacesByName, loadWorkspaces } from '../workspaces'

interface IAddCommandOptions {
  configFilename: string
  cwd: string
}

interface IAddOptions {
  configFilename: string
  cwd: string
  dev: boolean
  packages: string[]
  workspaceSwitch: string
}

/**
 * Add dependencies to workspaces
 * @param options
 */
export const add = async (options: IAddOptions) => {
  try {
    /**
     * Load all workspaces in the mono repo
     */
    const monoRepoWorkspaces = await loadWorkspaces(options.cwd, options.configFilename)

    /**
     * Determine target workspaces
     */
    const targetWorkspaces = await findWorkspacesByName(
      monoRepoWorkspaces,
      options.workspaceSwitch ? options.workspaceSwitch.split(',') : []
    )

    defaultLogger.info(`Target workspaces [${targetWorkspaces.map(w => `'${w.name}'`).join(',')}]`)

    const packages = options.packages

    /**
     * Determine packages to install from NPM
     */
    const npmPackages = packages.filter(p => !monoRepoWorkspaces.find(w => w.name === p))
    if (npmPackages.length > 0) {
      defaultLogger.info(`Adding ${options.dev ? 'dev ' : ''}dependencies from NPM [${npmPackages.join(',')}]`)
    }

    /**
     * Determine packages to install from workspaces
     */
    const workspacePackages = packages.filter(p => monoRepoWorkspaces.find(w => w.name === p))
    if (workspacePackages.length > 0) {
      defaultLogger.info(
        `Adding ${options.dev ? 'dev ' : ''}dependencies from workspaces [${workspacePackages.join(',')}]`
      )
    }

    /**
     * Install NPM packages
     */
    if (npmPackages.length > 0) {
      for (const targetWorkspace of targetWorkspaces) {
        try {
          await exec(`yarn add ${npmPackages.map(p => p).join(' ')} ${options.dev ? '--dev' : ''}`, {
            cwd: targetWorkspace.__workspaceDir
          })
        } catch (err) {
          defaultLogger.warn(err)
        }
      }
    }

    /**
     * Install workspace packages
     */
    if (workspacePackages.length > 0) {
      /**
       * Manually update each package.json file
       * NOTE: only safe to do once all npm installs have been performed
       */
      await Promise.all(
        targetWorkspaces.map(async targetWorkspace => {
          const packageJsonFilepath = resolve(targetWorkspace.__workspaceDir, 'package.json')
          const packageJson = await readJson(packageJsonFilepath)
          const dependencyKey = options.dev ? 'devDependencies' : 'dependencies'

          workspacePackages.forEach(p => {
            const installWorkspace = monoRepoWorkspaces.find(w => w.name === p)
            /**
             * Don't install into self
             */
            if (installWorkspace && targetWorkspace.name !== installWorkspace.name) {
              if (packageJson[dependencyKey]) {
                packageJson[dependencyKey][installWorkspace.name] = installWorkspace.version
              } else {
                packageJson[dependencyKey] = { [installWorkspace.name]: installWorkspace.version }
              }
            }
          })

          await writeJson(packageJsonFilepath, packageJson, { spaces: 2 })
        })
      )

      /**
       * Now install
       */
      try {
        await exec('yarn install', { cwd: options.cwd })
      } catch (err) {
        defaultLogger.warn(err)
      }
    }

    defaultLogger.info('Done 🎉')
  } catch (error) {
    defaultLogger.error(error)
  }
}

/**
 * Apply the 'add' command to the yargs CLI
 * @param yargv Instance of yargs CLI
 */
export const applyAddCommand = (argv: Argv, options: IAddCommandOptions) =>
  argv.command(
    'add [packages...]',
    'Add packages to workspaces',
    yargs => {
      return yargs.option('D', {
        alias: 'dev',
        boolean: true,
        describe: 'Mark as dev dependencies.'
      })
    },
    args => {
      add({
        ...options,
        dev: args.dev,
        packages: args.packages,
        workspaceSwitch: args.workspaces
      })
    }
  )
