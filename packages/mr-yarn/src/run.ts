import * as yargs from 'yargs'
import { applyAddCommand } from './commands/add'
import { applyRemoveCommand } from './commands/remove'
import { applyRunCommand } from './commands/run'

export const run = async (configFilename: string, cwd: string) => {
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
  yargv = applyAddCommand(yargv, cwd, configFilename)
  yargv = applyRunCommand(yargv, cwd, configFilename)
  yargv = applyRemoveCommand(yargv, cwd, configFilename)

  /**
   * Run CLI
   */
  yargv
    .help()
    .version()
    .parse()
}
