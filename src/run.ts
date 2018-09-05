/**
 * Import colors before everything as it extends string.prototype
 */
import 'colors'
import * as yargs from 'yargs'

export const run = () => yargs.help().argv
