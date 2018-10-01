import { Argv } from 'yargs'
import { exec } from '../exec'
import { defaultLogger } from '../logger'
import { findWorkspacesByName, loadWorkspaces } from '../workspaces'

interface IRemoveCommandOptions {
    configFilename: string
    cwd: string
}

interface IRemoveOptions {
    configFilename: string
    cwd: string
    packages: string[]
    workspaceSwitch: string
}

/**
 * Remove dependencies to workspaces
 * @param options
 */
export const remove = async (options: IRemoveOptions) => {
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
        for (const targetWorkspace of targetWorkspaces) {
            try {
                await exec(
                    `yarn remove ${options.packages.join(' ')}`,
                    {
                        cwd: targetWorkspace.__workspaceDir
                    }
                )
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
 * Apply the 'remove' command to the yargs CLI
 * @param yargv Instance of yargs CLI
 */
export const applyRemoveCommand = (argv: Argv, options: IRemoveCommandOptions) =>
    argv.command(
        'remove [packages...]',
        'Remove packages from workspaces',
        yargs => yargs,
        args => {
            remove({
                ...options,
                packages: args.packages,
                workspaceSwitch: args.workspaces
            })
        }
    )
