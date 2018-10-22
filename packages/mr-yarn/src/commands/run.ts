import {exec} from 'child_process'

const colors = require('colors/safe') // tslint:disable-line
import {Argv} from 'yargs'
import {extractForwardedOptions} from '../args'
import {createLogger, defaultLogger} from '../logger'
import {IWorkspace, loadTargetWorkspaces} from '../workspaces'

const getRandomColor = () => {
    const shellColors = [
        // 'black', // most terminals are black
        // 'red',
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

export const expandWorkspaceScripts = (targetWorkspaces: IWorkspace[], scriptPattern: string) => {
    return targetWorkspaces
        .reduce((acc: Array<{ workspace: IWorkspace, script: string }>, workspace) =>
                workspace.scripts ?
                    [...acc, ...Object.keys(workspace.scripts)
                        .filter(s => s.startsWith(scriptPattern.split('*')[0]))
                        .map(s => ({workspace, script: s}))]
                    : acc
            , [])
}

/**
 * Run NPM script in workspaces
 */
export const run = async (scriptPattern: string, getTargetWorkspaces: () => Promise<IWorkspace[]>) => {
    try {
        /**
         * Load target workspaces
         */
        const targetWorkspaces = await getTargetWorkspaces()
        defaultLogger.info(`Target workspaces [${targetWorkspaces.map(w => `'${w.name}'`).join(',')}]`)

        /**
         * Build forwarded options
         * Find '--' which denotes the start of options to forward
         * Then grab everything after it
         */
        const forwardedOptions = extractForwardedOptions(process.argv)

        /**
         * Execute script in every workspace in parallel
         */
        interface IRunResult { code: number, workspace: IWorkspace, script: string }

        const results: IRunResult[] = await Promise.all(
            expandWorkspaceScripts(targetWorkspaces, scriptPattern)
                .map(async ({workspace, script}) => {
                    const runner = exec(`yarn ${script} ${forwardedOptions}`, {cwd: workspace.__workspaceDir})

                    /**
                     * Report progress on the fly every time a log comes out
                     */
                    const workspaceLogger = createLogger({prefix: colors[getRandomColor()](`[${workspace.name}]`)})

                    runner.stdout.on('data', data => {
                        workspaceLogger.info(data.toString())
                    })

                    runner.stderr.on('data', data => {
                        workspaceLogger.error(data.toString())
                    })

                    /**
                     *  Resolve promise only once the child process has closed
                     */
                    return new Promise<IRunResult>((resolve) => {
                        runner.on('exit', code => {
                            resolve({code, workspace, script})
                        })
                    })
                })
        )

        for (const {code, workspace, script} of results) {
            if (code > 1) {
                defaultLogger.error(`Script ${script} in ${workspace.name} exited with error code ${code}.`)
            }
        }

        if (results.find(({code}) => code > 0)) {
            process.exit(1)
        }

        defaultLogger.info('Done 🎉')
    } catch (error) {
        defaultLogger.error(`Something unexpectedly failed.`)
        defaultLogger.error(error)
        process.exit(1)
    }
}

/**
 * Apply the 'run' command to the yargs CLI
 * @param yargv Instance of yargs CLI
 */
export const applyRunCommand = (argv: Argv, cwd: string, configFilename: string) =>
    argv.command(
        'run <script> [options...]',
        'Run NPM script in workspaces',
        yargs => yargs,
        args => {
            run(args.script, () => loadTargetWorkspaces(args.workspaces, cwd, configFilename))
        }
    )
