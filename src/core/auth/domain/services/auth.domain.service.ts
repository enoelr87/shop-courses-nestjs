import { UserProps } from '../models/user.model';
import { IUserRepository } from '../interfaces/types';
import { hashPassword, comparePassword } from '../../utils/password';
import { LoginUserDto } from '../../utils/validation';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { UserAlreadyExistsException } from '../exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { EmailAlreadyUsedException } from '../exceptions/email-already-used.exception';
import { IAuthService } from '../interfaces/auth.service.interface';
import { ConfigService } from '@nestjs/config';
import { LoginAttemptsRule } from '../rules/login-attempts.rule';

export class AuthDomainService implements IAuthService {
  private readonly userRepository: IUserRepository;
  private readonly loginAttemptsRule: LoginAttemptsRule;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    const configService = new ConfigService();

    const maxAttempts = configService.get<number>('ATTEMPS_LOGIN') || 3;
    const lockoutDurationMinutes =
      configService.get<number>('LOCKOUT_DURATION_MINUTES') || 1;
    this.loginAttemptsRule = new LoginAttemptsRule({
      maxAttempts,
      lockoutDurationMinutes,
    });
  }

  async register(userProps: UserProps): Promise<UserProps> {
    const existingUser = await this.userRepository.findByEmail(userProps.email);
    if (existingUser) {
      throw new EmailAlreadyUsedException();
    }

    const userWithCpf = await this.userRepository.findByCpf(userProps.cpf);
    if (userWithCpf) {
      throw new UserAlreadyExistsException();
    }

    const normalizedPassword = userProps.password
      .normalize('NFKC')
      .replace(/\s+/g, '');

    const hashedPassword = await hashPassword(normalizedPassword);
    const userWithHashedPassword = { ...userProps, password: hashedPassword };

    const createdUser = await this.userRepository.create(
      userWithHashedPassword,
    );
    return createdUser;
  }

  async login(loginDto: LoginUserDto): Promise<UserProps> {
    const { username, password } = loginDto;
    this.loginAttemptsRule.checkLoginAttempts(username);

    const user = await this.userRepository.findByEmail(username);
    console.log('user', user);
    if (!user) {
      this.loginAttemptsRule.incrementLoginAttempts(username);
      throw new InvalidCredentialsException();
    }

    const normalizedPassword = password.normalize('NFKC').replace(/\s+/g, '');

    const isPasswordValid = await comparePassword(
      normalizedPassword,
      user.password,
    );
    if (!isPasswordValid) {
      this.loginAttemptsRule.incrementLoginAttempts(username);
      throw new InvalidCredentialsException();
    }

    // Login exitoso, resetear intentos
    this.loginAttemptsRule.resetLoginAttempts(username);
    return user;
  }

  async update(cpf: string, updates: Partial<UserProps>): Promise<UserProps> {
    const existingUser = await this.userRepository.findByCpf(cpf);
    if (!existingUser) {
      throw new UserNotFoundException();
    }

    if (updates.email && updates.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(
        updates.email,
      );
      if (userWithEmail) {
        throw new EmailAlreadyUsedException();
      }
    }

    if (updates.password) {
      const normalizedPassword = updates.password
        .normalize('NFKC')
        .replace(/\s+/g, '');
      updates.password = await hashPassword(normalizedPassword);
    }

    const updatedUser: UserProps = {
      ...existingUser,
      ...updates,
      cpf: existingUser.cpf,
    };

    return await this.userRepository.update(updatedUser);
  }
}
