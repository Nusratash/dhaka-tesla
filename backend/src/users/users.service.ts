import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['wallet'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
