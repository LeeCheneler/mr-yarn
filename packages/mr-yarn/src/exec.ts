import { exec as doExec, ExecOptions } from 'child_process'
import { promisify } from 'util'

/**
 * Exec a command
 * @param command Command to execute
 * @param options
 */
export const exec = async (command: string, options: ExecOptions) => {
  const result = await promisify(doExec)(command, options)

  if (result.stderr) {
    throw new Error(result.stderr)
  }

  return result
}
