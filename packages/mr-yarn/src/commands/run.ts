import { exec } from 'child_process'
const colors = require('colors/safe') // tslint:disable-line
import { Argv } from 'yargs'
import { extractForwardedOptions } from '../args'
import { createLogger, defaultLogger } from '../logger'
import { findWorkspacesByName, loadWorkspaces } from '../workspaces'

interface IRunCommandOptions {
  configFilename: string
  cwd: string
}

interface IRunOptions {
  configFilename: string
  cwd: string
  script: string
  workspaceSwitch: string
}

const getRandomColor = () => {
  const shellColors = [
    // 'black', // most terminals are black
    'red',
    'green',
    'yellow',
    // 'blue', // too dark
    'magenta',
    'cyan',
    'white',
    'gray',
    'grey'
  ]

  return shellColors[Math.floor(Math.random() * shellColors.length)]
}

/**
 * Run NPM script in workspaces
 * @param options
 */
export const run = async (options: IRunOptions) => {
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
     * Build forwarded options
     * Find '--' which denotes the start of options to forward
     * Then grab everything after it
     */
    const forwardedOptions = extractForwardedOptions(process.argv);

    /**
     * Execute script in every workspace in parallel
     */
    await Promise.all(
      targetWorkspaces.map(async workspace => {
        const runner = exec(`yarn ${options.script} ${forwardedOptions}`, { cwd: workspace.__workspaceDir })

        /**
         * Report progress on the fly every time a log comes out
         */
        const workspaceLogger = createLogger({ prefix: colors[getRandomColor()](`[${workspace.name}]`) })

        runner.stdout.on('data', data => {
          workspaceLogger.info(data.toString())
        })

        runner.stderr.on('data', data => {
          workspaceLogger.error(data.toString())
        })

        /**
         *  Resolve promise only once the child process has closed
         */
        return new Promise(resolve => {
          runner.on('close', resolve)
        })
      })
    )

    defaultLogger.info('Done 🎉')
  } catch (error) {
    defaultLogger.error(error)
  }
}

/**
 * Apply the 'run' command to the yargs CLI
 * @param yargv Instance of yargs CLI
 */
export const applyRunCommand = (argv: Argv, options: IRunCommandOptions) =>
  argv.command(
    'run <script> [options...]',
    'Run NPM script in workspaces',
    yargs => yargs,
    args => {
      run({
        ...options,
        script: args.script,
        workspaceSwitch: args.workspaces
      })
    }
  )
