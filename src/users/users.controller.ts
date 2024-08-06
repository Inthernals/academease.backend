import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Roles as RolesEnum } from './enums/roles.enum';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { QueryUsersDto } from './dtos/query-user.dto';

@UseGuards(AccessTokenGuard)
@Controller('/api/protected/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  getAllUsers(@Query() query: QueryUsersDto) {
    return this.usersService.getAllUsers(query);
  }

  @Get('/id/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new HttpException('User not found!', 404);
    return user;
  }

  @Get('/name/:name')
  async getUserByName(@Param('name') name: string) {
    const user = await this.usersService.getUserByName(name);
    if (!user) throw new HttpException('User not found!', 404);
    return user;
  }

  @Get('/email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new HttpException('User not found!', 404);
    return user;
  }

  @Roles(RolesEnum.SUPERUSER, RolesEnum.MEMBER)
  @UseGuards(RoleGuard)
  @Patch('/:name')
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfileByName(
    @Param('name') name: string,
    @Body() body: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    if (photo) {
      const uploadedImage = await this.cloudinaryService.uploadFile(
        photo,
        true,
      );
      body.photo = uploadedImage.secure_url;
    }
    const user = await this.usersService.getUserByName(name);
    if (!user) return new HttpException('User not found!', 404);
    return this.usersService.updateUserByName(name, body);
  }

  @Roles(RolesEnum.SUPERUSER)
  @UseGuards(RoleGuard)
  @Patch('/restore/:name')
  async restoreDeletedUserByName(@Param('name') name: string) {
    const user = await this.usersService.getUserByName(name);
    if (!user) return new HttpException('User not found!', 404);
    return this.usersService.restoreDeletedUserByName(name);
  }

  @Roles(RolesEnum.SUPERUSER, RolesEnum.MEMBER)
  @UseGuards(RoleGuard)
  @Delete('/soft/:name')
  async softDeleteUserByName(@Param('name') name: string) {
    const user = await this.usersService.getUserByName(name);
    if (!user) return new HttpException('User not found!', 404);
    return this.usersService.softDeleteUserByName(name);
  }

  @Roles(RolesEnum.SUPERUSER)
  @UseGuards(RoleGuard)
  @Delete('/hard/:name')
  async hardDeleteUserByName(@Param('name') name: string) {
    const user = await this.usersService.getUserByName(name);
    if (!user) return new HttpException('User not found!', 404);
    return this.usersService.hardDeleteUserByName(name);
  }
}
