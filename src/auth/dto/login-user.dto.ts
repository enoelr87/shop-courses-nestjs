import { ApiProperty } from '@nestjs/swagger';
import { LoginUserDto as DomainLoginUserDto } from '../../core/auth/utils/validation';

export class LoginUserDto implements DomainLoginUserDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'User email address',
  })
  username: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'User password',
  })
  password: string;
}
