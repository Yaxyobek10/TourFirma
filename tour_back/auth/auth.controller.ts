import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Roles } from './roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }






  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiResponse({ status: 200, description: 'Returns a new access token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        },
      },
      required: ['refresh_token'],
    },
  })
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }







 @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.TOURFIRMA, UserRole.GUIDE, UserRole.RENT_CAR, UserRole.TOURIST)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.authService.changePassword(userId, dto);
  }





  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset token to user email' })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetPasswordEmail(email);
  }






  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }


}

