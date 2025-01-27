import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = new Date();

  // Log request
  logger.info('Incoming Request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response using response event listener
  res.on('finish', () => {
    const duration = new Date().getTime() - startTime.getTime();
    
    logger.info('Response Sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
}; 