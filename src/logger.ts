import { createLogger, format, transports } from 'winston'

export const defaultLogger = createLogger({
  format: format.cli(),
  level: 'info',
  transports: [new transports.Console()]
})
