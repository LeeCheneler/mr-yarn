import * as yargs from 'yargs'
import { applyAddCommand } from './commands/add'
import { defaultLogger } from './logger'

export interface IRunOptions {
  configFilename: string
  cwd: string
}

export const run = async ({ configFilename, cwd }: IRunOptions) => {
  try {
    /**
     * Configure global switches
     */
    let yargv = yargs.option('w', {
      alias: 'workspaces',
      describe: 'Filter by workspace names. Defaults to all when option not present.'
    })

    /**
     * Apply commands
     */
    yargv = applyAddCommand(yargv, { configFilename, cwd })

    /**
     * Run CLI
     */
    yargv
      .help()
      .version()
      .parse()
  } catch (error) {
    defaultLogger.error(error)
  }
}
