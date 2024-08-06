import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthDto } from './dtos/auth.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  hashData(data: string) {
    return argon2.hash(data);
  }

  async getTokens(userId: string, role: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          role,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '30s',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          role,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.role, user.email);

    return tokens;
  }

  async signUp(createUserDto: CreateUserDto) {
    const userExisyByEmail = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (userExisyByEmail) throw new HttpException('User already exist!', 400);

    const userExistByName = await this.usersService.getUserByName(
      createUserDto.name,
    );
    if (userExistByName) throw new HttpException('User already exist!', 400);

    const hashPassword = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.createUser({
      ...createUserDto,
      password: hashPassword,
    });

    const tokens = await this.getTokens(
      newUser.id,
      newUser.role,
      newUser.email,
    );

    return {
      ...newUser,
      ...tokens,
    };
  }

  async signIn(authDto: AuthDto) {
    const user = await this.usersService.getUserByEmail(authDto.email);
    if (!user) throw new HttpException('User does not exist!', 400);

    const passwordMatches = await argon2.verify(
      user.password,
      authDto.password,
    );
    if (!passwordMatches) throw new HttpException('Password incorrect', 400);

    const tokens = await this.getTokens(user.id, user.role, user.email);

    return {
      ...user,
      ...tokens,
    };
  }

  async signout() {
    return {
      message: 'Successfully logged out!',
      statusCode: 200,
    };
  }
}
