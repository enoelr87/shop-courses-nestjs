import { Injectable } from '@nestjs/common';
import { AuthApplicationService } from 'src/core/auth/application/auth.application.service';
import { IAuthApplication } from 'src/core/auth/domain/interfaces/auth.application.interface';
import { AuthService } from './auth.service';
import { UserProps } from 'src/core/auth/domain/models/user.model';
import { LoginUserDto, RegisterUserDto } from 'src/core/auth/utils/validation';
import { UpdateUserDto } from 'src/core/auth/application/usecases/update.use-case';

@Injectable()
export class AuthApplicationProvider implements IAuthApplication {
  private readonly authApplicationService: AuthApplicationService;

  constructor(private readonly authRepository: AuthService) {
    this.authApplicationService = new AuthApplicationService(
      this.authRepository,
    );
  }

  async login(loginDto: LoginUserDto): Promise<UserProps> {
    return this.authApplicationService.login(loginDto);
  }

  async register(registerDto: RegisterUserDto): Promise<UserProps> {
    return this.authApplicationService.register(registerDto);
  }

  async update(dto: UpdateUserDto): Promise<UserProps> {
    return this.authApplicationService.update(dto);
  }
}
