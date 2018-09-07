import 'colors'
import { createLogger as createWinstonLogger, format, Logger, transports } from 'winston'
import { config } from './config'

interface ICreateLoggerProps {
  prefix: string
}

export const createLogger = ({ prefix }: ICreateLoggerProps): Logger =>
  createWinstonLogger({
    format: format.combine(format.colorize(), format.printf(info => `${prefix} ${info.level}: ${info.message}`)),
    level: 'info',
    transports: [new transports.Console()]
  })

export const defaultLogger = createLogger({
  prefix: config.defaultPrefix
})
