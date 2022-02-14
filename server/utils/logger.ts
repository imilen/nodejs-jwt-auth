import { createLogger, format, transports } from "winston";
import moment from "moment";
import _ from "lodash";

const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format((info) => {
          info.level = info.level.toUpperCase();
          return info;
        })(),
        format.colorize({ all: false }),
        format.align(),
        format.printf((info) => {
          const { level, message, ...meta } = info;
          const date = moment(Date.now()).format("DD/MM/YY hh:mm:ss:SSS");
          if (!_.isEmpty(meta)) {
            return `${date} - ${level}: ${message}: ${JSON.stringify(
              meta,
              null,
              2
            )}`;
          } else {
            return `${date} - ${level}: ${message}`;
          }
        })
      ),
    }),
  ],
});

export const log = {
  info(value: any, ...rest: any) {
    logger.info(value, ...rest);
  },
  error(value: any, ...rest: any) {
    logger.error(value, ...rest);
  },
  warn(value: any, ...rest: any) {
    logger.warn(value, ...rest);
  },
};
