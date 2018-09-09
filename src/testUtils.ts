import { exec as doExec, ExecOptions } from 'child_process'
import { promisify } from 'util'

/**
 * Simply promisifies the standard node 'exec' function
 * @param options options
 */
export const exec = async (command: string, options: ExecOptions) => promisify(doExec)(command, options)
