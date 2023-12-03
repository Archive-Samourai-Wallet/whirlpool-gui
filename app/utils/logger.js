import log from 'electron-log';

class Logger {

  constructor(level) {
    this.setLevel(level)
    this.debug("logger started: "+log.transports.file.getFile().path)
  }

  error(...args) {
    return log.error(...args)
  }

  warn(...args) {
    return log.warn(...args)
  }

  info(...args) {
    return log.info(...args)
  }

  verbose(...args) {
    return log.verbose(...args)
  }

  debug(...args) {
    return log.debug(...args)
  }

  setLevel(level) {
    log.transports.file.level = level;
    log.transports.console.level = level;
  }
}

export const logger = new Logger('debug')
