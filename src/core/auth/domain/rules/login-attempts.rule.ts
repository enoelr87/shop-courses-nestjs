import { MaxLoginAttemptsException } from '../exceptions/max-login-attempts.exception';

export interface LoginAttempt {
  count: number;
  lastAttempt: Date;
}

export interface LoginAttemptsConfig {
  maxAttempts: number;
  lockoutDurationMinutes: number;
}

export class LoginAttemptsRule {
  private readonly loginAttempts: Map<string, LoginAttempt> = new Map();
  private readonly lockoutDuration: number;

  constructor(private readonly config: LoginAttemptsConfig) {
    this.lockoutDuration = config.lockoutDurationMinutes * 60 * 1000;
  }

  checkLoginAttempts(email: string): void {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return;

    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime();

    if (timeSinceLastAttempt >= this.lockoutDuration) {
      this.loginAttempts.delete(email);
      return;
    }

    if (attempts.count >= this.config.maxAttempts) {
      const remainingTime = Math.ceil(
        (this.lockoutDuration - timeSinceLastAttempt) / 1000 / 60,
      );
      throw new MaxLoginAttemptsException(remainingTime);
    }
  }

  incrementLoginAttempts(email: string): void {
    const attempts = this.loginAttempts.get(email) || {
      count: 0,
      lastAttempt: new Date(),
    };
    attempts.count += 1;
    attempts.lastAttempt = new Date();
    this.loginAttempts.set(email, attempts);
  }

  resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }
}
