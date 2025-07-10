import winston from 'winston';

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  help: 3,
  debug: 4,
};

// 根据环境选择日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// 定义日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  help: 'cyan',
  debug: 'white',
};

winston.addColors(colors);

// 定义日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// 文件日志格式（不包含颜色）
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// 定义传输器
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format,
  }),
  // 应用日志文件（带大小限制）
  new winston.transports.File({
    filename: 'logs/application.log',
    format: fileFormat,
    level: 'info',
    maxsize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5, // 保留5个文件
    tailable: true,
  }),
  // 错误日志文件（带大小限制）
  new winston.transports.File({
    filename: 'logs/error.log',
    format: fileFormat,
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10, // 保留10个文件
    tailable: true,
  }),
];

// 创建logger实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  // 异常处理
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
  // 拒绝处理
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

export default logger;
