import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IUserRepository,
  UserWithoutPassword,
} from 'src/core/auth/domain/interfaces/types';
import { UserProps } from 'src/core/auth/domain/models/user.model';
import { User } from 'src/shemas/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private excludePassword<T extends User>(user: T): Omit<T, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...staffWithoutPassword } = user;
    return staffWithoutPassword;
  }

  private createUserEntity(userData: UserProps): User {
    return this.userRepository.create({
      cpf: userData.cpf,
      name: userData.name,
      lastname: userData.lastName,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      active: true,
      validateAccount: null,
    });
  }

  async findByEmail(email: string): Promise<UserProps | null> {
    const staff = await this.userRepository.findOne({ where: { email } });
    if (!staff) return null;
    return staff;
  }

  async findByEmailWithoutPassword(
    email: string,
  ): Promise<UserWithoutPassword | null> {
    const staff = await this.userRepository.findOne({ where: { email } });
    return staff ? this.excludePassword(staff) : null;
  }

  async findByCpf(cpf: string): Promise<UserProps | null> {
    const staff = await this.userRepository.findOne({ where: { cpf } });
    if (!staff) return null;
    return staff;
  }

  async create(user: UserProps): Promise<UserProps> {
    const newUser = this.createUserEntity(user);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async update(user: UserProps): Promise<UserProps> {
    const existingStaff = await this.userRepository.findOne({
      where: { cpf: user.cpf },
    });

    if (!existingStaff) {
      throw new Error('User not found');
    }

    // Update fields
    const updatedStaff = this.userRepository.merge(existingStaff, {
      name: user.name,
      lastname: user.lastName,
      email: user.email,
      phone: user.phone,
      active: user.active ?? existingStaff.active,
      validateAccount: user.validateAccount ?? existingStaff.validateAccount,
      // Only update password if provided in the update
      ...(user.password && { password: user.password }),
    });

    // Save the updated entity
    const savedUser = await this.userRepository.save(updatedStaff);
    return savedUser;
  }
}
