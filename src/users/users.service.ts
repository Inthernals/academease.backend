import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryUsersDto } from './dtos/query-user.dto';

const userSelect = {
  id: true,
  name: true,
  email: true,
  fullname: true,
  photo: true,
  role: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getAllUsers(query: QueryUsersDto) {
    const pgNum = +(query.pgNum ?? 1);
    const pgSize = +(query.pgSize ?? 10);
    const skip = (pgNum - 1) * pgSize;
    const take = pgSize;

    const where: Prisma.UserWhereInput = {
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),
      ...(query.fullname && {
        fullname: { contains: query.fullname, mode: 'insensitive' },
      }),
      ...(query.role && { role: query.role }),
      ...(query.onlyDeleted === 'true'
        ? { isDeleted: true }
        : { isDeleted: false }),
    };

    const user = await this.prismaService.user.findMany({
      skip,
      take,
      where,
      select: userSelect,
    });

    const userCount = await this.prismaService.user.count({ where });

    return {
      user,
      meta: {
        count: userCount,
      },
    };
  }

  getUserById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: userSelect,
    });
  }

  getUserByName(name: string) {
    return this.prismaService.user.findUnique({
      where: {
        name: name,
      },
      select: userSelect,
    });
  }

  getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async createUser(createUserData: Prisma.UserCreateInput) {
    const user = await this.prismaService.user.create({
      data: {
        ...createUserData,
      },
      select: userSelect,
    });

    return user;
  }

  async updateUserByName(name: string, updateUserData: Prisma.UserUpdateInput) {
    const user = await this.prismaService.user.update({
      where: {
        name,
      },
      data: updateUserData,
      select: userSelect,
    });

    return {
      statusCode: 200,
      message: 'Successfully update this user data!',
      user,
    };
  }

  async restoreDeletedUserByName(name: string) {
    const user = await this.prismaService.user.update({
      where: {
        name,
      },
      data: { isDeleted: false, deletedAt: null },
      select: userSelect,
    });

    return {
      statusCode: 200,
      message: 'Successfully restore this user data!',
      user,
    };
  }

  async softDeleteUserByName(name: string) {
    await this.prismaService.user.update({
      where: {
        name,
      },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return {
      statusCode: 200,
      message: 'Successfully delete the user!',
    };
  }

  async hardDeleteUserByName(name: string) {
    await this.prismaService.user.delete({
      where: {
        name,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully delete the user!',
    };
  }
}
