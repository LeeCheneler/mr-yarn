import { readJson, writeJson } from 'fs-extra'
import { resolve } from 'path'
const semverRegex: () => RegExp = require('semver-regex') // tslint:disable-line
import { Argv } from 'yargs'
const validateNPMPackageName = require('validate-npm-package-name') // tslint:disable-line
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

interface IParsedPackage {
  atVersion: string
  name: string
  version?: string
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

    /**
     *  Breakdown packages into meaningful parts
     */
    const packages = options.packages.map(p => {
      const [name, version] = p.split('@')

      return {
        atVersion: version ? `@${version}` : '', // used to simplify conditional name/version concat
        name,
        version
      }
    })

    /**
     * Assert the validity if the name and version parts
     */
    const invalidPackages = packages.filter(({ name, version }) => {
      const isNameValid = validateNPMPackageName(`${name}`).validForNewPackages
      const isVersionValid = version ? semverRegex().test(version) : true

      return !isNameValid || !isVersionValid
    })

    if (invalidPackages.length > 0) {
      throw new Error(
        `Following packages are invalid: [${invalidPackages
          .map(({ name, atVersion }) => `'${name}${atVersion}'`)
          .join(',')}]`
      )
    }

    /**
     * Determine packages to install from NPM
     */
    const npmPackages = packages.filter((p: IParsedPackage) => !monoRepoWorkspaces.find(w => w.name === p.name))
    if (npmPackages.length > 0) {
      defaultLogger.info(
        `Adding ${options.dev ? 'dev ' : ''}dependencies from NPM [${npmPackages
          .map(({ atVersion, name }) => `'${name}${atVersion}'`)
          .join(',')}]`
      )
    }

    /**
     * Determine packages to install from workspaces
     */
    const workspacePackages = packages.filter((p: IParsedPackage) => monoRepoWorkspaces.find(w => w.name === p.name))
    if (workspacePackages.length > 0) {
      defaultLogger.info(
        `Adding ${options.dev ? 'dev ' : ''}dependencies from workspaces [${workspacePackages
          .map(({ atVersion, name }) => `'${name}${atVersion}'`)
          .join(',')}]`
      )
    }

    /**
     * Install NPM packages
     */
    if (npmPackages.length > 0) {
      for (const targetWorkspace of targetWorkspaces) {
        await exec(
          `yarn add ${npmPackages.map(({ atVersion, name }) => `'${name}${atVersion}'`).join(' ')} ${
            options.dev ? '--dev' : ''
          }`,
          {
            cwd: targetWorkspace.__workspaceDir
          }
        )
      }
    }

    /**
     * Install workspace packages
     */
    if (workspacePackages.length > 0) {
      await Promise.all(
        targetWorkspaces.map(async targetWorkspace => {
          /**
           * Manually update each package.json file
           * NOTE: only safe to do once all npm installs have been performed
           */
          const packageJsonFilepath = resolve(targetWorkspace.__workspaceDir, 'package.json')
          const packageJson = await readJson(packageJsonFilepath)
          const dependencyKey = options.dev ? 'devDependencies' : 'dependencies'

          workspacePackages.forEach(p => {
            const installWorkspace = monoRepoWorkspaces.find(w => w.name === p.name)
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

          /**
           * Now install
           */
          await exec('yarn install', { cwd: targetWorkspace.__workspaceDir })
        })
      )
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
