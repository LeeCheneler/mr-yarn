/**
 * Import colors before everything as it extends string.prototype
 */
import 'colors'
import * as yargs from 'yargs'
import { defaultLogger } from './logger'

export const run = () => {
  defaultLogger.info('testing...')
  yargs.help().argv // tslint:disable-line
}
