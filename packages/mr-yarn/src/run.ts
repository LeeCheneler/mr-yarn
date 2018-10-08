import * as yargs from 'yargs'
import { applyAddCommand } from './commands/add'
import { applyRemoveCommand } from './commands/remove'
import { applyRunCommand } from './commands/run'

export interface IRunOptions {
  configFilename: string
  cwd: string
}

export const run = async ({ configFilename, cwd }: IRunOptions) => {
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
  yargv = applyRunCommand(yargv, { configFilename, cwd })
  yargv = applyRemoveCommand(yargv, { configFilename, cwd })

  /**
   * Run CLI
   */
  yargv
    .help()
    .version()
    .parse()
}
