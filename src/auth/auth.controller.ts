import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { AuthDto } from './dtos/auth.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('cookies')
  getCookies(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    return request.cookies;
  }

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.cookies.refreshTokenServer)
      throw new UnauthorizedException('User already logged in!');

    const { accessToken, refreshToken, ...user } =
      await this.authService.signUp(createUserDto);

    if (accessToken && refreshToken)
      response.cookie('refreshTokenServer', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });

    return { ...user, access_token: accessToken };
  }

  @Post('signin')
  async signin(
    @Body() authDto: AuthDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (request.cookies.refreshTokenServer)
      throw new UnauthorizedException('User already logged in!');

    const { accessToken, refreshToken, ...user } =
      await this.authService.signIn(authDto);

    if (accessToken && refreshToken)
      response.cookie('refreshTokenServer', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });

    return { ...user, access_token: accessToken };
  }

  @Delete('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshTokenServer');

    return this.authService.logout();
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshTokens(@Req() request: Request) {
    // @ts-ignore
    const userId = request.user.sub;
    const tokens = await this.authService.refreshTokens(userId);

    return { access_token: tokens.accessToken };
  }
}
