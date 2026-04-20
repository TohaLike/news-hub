import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  public async findAll() {
    return `This action returns all user`;
  }

  public async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  public async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    // Здесь должна быть логика поиска пользователя по email в базе данных
    return null; // Вернуть найденного пользователя или null, если не найден
  }

  public async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
