import 'colors'
import { createLogger as createWinstonLogger, format, Logger, transports } from 'winston'
import { config } from './config'

interface ICreateLoggerOptions {
  prefix: string
}

/**
 * Create a logger
 * @param ICreateLoggerOptions
 */
export const createLogger = ({ prefix }: ICreateLoggerOptions): Logger =>
  createWinstonLogger({
    format: format.combine(format.colorize(), format.printf(info => `${prefix} ${info.level}: ${info.message}`)),
    level: 'info',
    transports: [new transports.Console()]
  })

/**
 * Preconfigured logger
 */
export const defaultLogger = createLogger({
  prefix: config.defaultPrefix
})
