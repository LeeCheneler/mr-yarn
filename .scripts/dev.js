const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
require('colors')

/**
 * Run a shell command
 */
const runCommand = async command => {
  try {
    const { stderr, stdout } = await exec(command)

    if (stderr) console.error(stderr.red)
    if (stdout) console.info(stdout)
  } catch (err) {
    console.error(err.toString().red)
  }
}

/**
 * Run dev script, build then relink the package
 */
const run = async () => {
  await runCommand('yarn build')
  try {
    await runCommand('yarn unlink')
    await runCommand('yarn link')
  } catch (err) {
    /**
     * Package was not already linked (eg. first time run)
     */
    await runCommand('yarn link')
  }
}

run()
