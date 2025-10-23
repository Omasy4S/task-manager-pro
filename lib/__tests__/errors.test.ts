/**
 * Unit Tests для Error Handling
 */

import {
  AppError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ErrorHandler,
  withRetry,
} from '../errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 500, true, { userId: '123' });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ userId: '123' });
    });
  });

  describe('AuthenticationError', () => {
    it('should create 401 error', () => {
      const error = new AuthenticationError('Not authenticated');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not authenticated');
    });
  });

  describe('ValidationError', () => {
    it('should create 400 error with field errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', errors);

      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error', () => {
      const error = new NotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });
  });
});

describe('ErrorHandler', () => {
  describe('handle', () => {
    it('should handle AppError', () => {
      const originalError = new ValidationError('Invalid input');
      const handled = ErrorHandler.handle(originalError);

      expect(handled).toBe(originalError);
    });

    it('should convert Error to AppError', () => {
      const originalError = new Error('Something went wrong');
      const handled = ErrorHandler.handle(originalError);

      expect(handled).toBeInstanceOf(AppError);
      expect(handled.message).toBe('Something went wrong');
    });

    it('should handle non-Error objects', () => {
      const handled = ErrorHandler.handle('String error');

      expect(handled).toBeInstanceOf(AppError);
      expect(handled.message).toBe('String error');
    });
  });

  describe('getUserMessage', () => {
    it('should return validation error messages', () => {
      const error = new ValidationError('Validation failed', [
        { field: 'email', message: 'Invalid email' },
      ]);

      const message = ErrorHandler.getUserMessage(error);
      expect(message).toBe('Invalid email');
    });

    it('should return AppError message', () => {
      const error = new NotFoundError('Task');
      const message = ErrorHandler.getUserMessage(error);

      expect(message).toBe('Task not found');
    });
  });

  describe('isOperational', () => {
    it('should return true for operational errors', () => {
      const error = new ValidationError('Invalid input');
      expect(ErrorHandler.isOperational(error)).toBe(true);
    });

    it('should return false for non-AppError', () => {
      const error = new Error('Unexpected error');
      expect(ErrorHandler.isOperational(error)).toBe(false);
    });
  });
});

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await withRetry(fn, { maxRetries: 3, delayMs: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Always fails'));

    await expect(
      withRetry(fn, { maxRetries: 2, delayMs: 10 })
    ).rejects.toThrow('Always fails');

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should call onRetry callback', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('success');

    const onRetry = jest.fn();

    await withRetry(fn, { maxRetries: 2, delayMs: 10, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });
});
