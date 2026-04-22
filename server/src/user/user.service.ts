import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<UserDocument> {
    const user = new this.userModel({
      email: data.email,
      password: data.password,
      name: data.name.trim(),
      role: data.role,
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.userModel.findById(id).exec();
  }

  async addRefreshToken(
    userId: Types.ObjectId | string,
    token: string,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { $push: { refreshTokens: token } })
      .exec();
  }

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { $pull: { refreshTokens: token } })
      .exec();
  }
}
