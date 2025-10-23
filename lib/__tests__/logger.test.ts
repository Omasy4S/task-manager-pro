/**
 * Unit Tests для Logger
 */

import { logger, LogLevel, generateCorrelationId } from '../logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Мокаем console методы
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logging levels', () => {
    it('should call logger.info without errors', () => {
      // В test окружении INFO не выводится, но метод должен работать
      expect(() => {
        logger.info('Test message', { userId: '123' });
      }).not.toThrow();
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { operation: 'test' });
      
      // В test окружении ERROR логируется
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(logOutput.level).toBe('error');
      expect(logOutput.message).toBe('Error occurred');
      expect(logOutput.error.message).toBe('Test error');
    });

    it('should call logger.warn without errors', () => {
      expect(() => {
        logger.warn('Warning message', { code: 'WARN_001' });
      }).not.toThrow();
    });

    it('should call logger.debug without errors', () => {
      expect(() => {
        logger.debug('Debug message', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('Context sanitization', () => {
    it('should redact sensitive data in error logs', () => {
      // Используем error чтобы лог точно вывелся в test окружении
      logger.error('User action failed', undefined, {
        userId: '123',
        password: 'secret123',
        apikey: 'key-123',
        token: 'secret-token',
        authorization: 'Bearer xxx',
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      
      // Проверяем, что чувствительные данные заменены на [REDACTED]
      expect(logOutput.context.password).toBe('[REDACTED]');
      expect(logOutput.context.apikey).toBe('[REDACTED]');
      expect(logOutput.context.token).toBe('[REDACTED]');
      expect(logOutput.context.authorization).toBe('[REDACTED]');
      expect(logOutput.context.userId).toBe('123'); // userId не чувствительный
    });
  });

  describe('generateCorrelationId', () => {
    it('should generate unique correlation IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs in correct format', () => {
      const id = generateCorrelationId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});
