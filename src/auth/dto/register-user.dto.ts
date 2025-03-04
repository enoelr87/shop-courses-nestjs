import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserDto as DomainRegisterUserDto } from '../../core/auth/utils/validation';

export class RegisterUserDto implements DomainRegisterUserDto {
  @ApiProperty({
    example: '12345678900',
    description: 'User CPF number',
  })
  cpf: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName: string;

  @ApiProperty({
    example: 'email@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
  })
  phone: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'User password',
  })
  password: string;
}
