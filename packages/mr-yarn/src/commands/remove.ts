import { Argv } from 'yargs'
import { exec } from '../exec'
import { defaultLogger } from '../logger'
import { IWorkspace, loadTargetWorkspaces } from '../workspaces'

/**
 * Remove dependencies to workspaces
 * @param options
 */
export const remove = async (packages: string[], getTargetWorkspaces: () => Promise<IWorkspace[]>) => {
  try {
    /**
     * Load target workspaces
     */
    const targetWorkspaces = await getTargetWorkspaces()
    defaultLogger.info(`Target workspaces [${targetWorkspaces.map(w => `'${w.name}'`).join(',')}]`)

    for (const targetWorkspace of targetWorkspaces) {
      try {
        await exec(`yarn remove ${packages.join(' ')}`, {
          cwd: targetWorkspace.__workspaceDir
        })
      } catch (err) {
        defaultLogger.warn(err)
      }
    }

    defaultLogger.info('Done 🎉')
  } catch (error) {
      defaultLogger.error(`Something unexpectedly failed.` )
      defaultLogger.error(error)
  }
}

/**
 * Apply the 'remove' command to the yargs CLI
 * @param yargv Instance of yargs CLI
 */
export const applyRemoveCommand = (argv: Argv, cwd: string, configFilename: string) =>
  argv.command(
    'remove [packages...]',
    'Remove packages from workspaces',
    yargs => yargs,
    args => {
      remove(args.packages, () => loadTargetWorkspaces(args.workspaces, cwd, configFilename))
    }
  )
