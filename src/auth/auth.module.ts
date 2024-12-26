import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/shemas/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthApplicationProvider } from './auth.application.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'your-secret-key', // In production, use environment variables
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthApplicationProvider,
    {
      provide: 'IUserRepository',
      useClass: AuthService,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
