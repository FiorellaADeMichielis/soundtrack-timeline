import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthStatus } from '@soundtrack-timeline/shared';
import { AuthService } from './auth.service';

const SESSION_COOKIE_NAME = 'st_session';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  private get frontendUrl(): string {
    return process.env.FRONTEND_URL ?? 'http://localhost:3000';
  }

  /**
   * Inicia el flujo de autenticación OAuth2 con PKCE.
   * Redirige al usuario al portal oficial de Spotify Accounts.
   */
  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const { url } = await this.authService.generateAuthorizationUrl();
    res.redirect(url);
  }

  /**
   * Endpoint de retorno (Callback) registrado ante Spotify Developer Dashboard.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (error) {
      res.redirect(`${this.frontendUrl}/?auth=error&reason=${encodeURIComponent(error)}`);
      return;
    }

    try {
      const result = await this.authService.handleCallback(code, state);

      // Cookie de sesión HttpOnly y SameSite Lax conforme a la Ley 25.326
      res.cookie(SESSION_COOKIE_NAME, result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 * 1000,
        path: '/',
      });

      res.redirect(`${this.frontendUrl}/?auth=success`);
    } catch {
      res.redirect(`${this.frontendUrl}/?auth=error&reason=exchange_failed`);
    }
  }

  /**
   * Devuelve el estado de autenticación de la sesión activa o confirma Modo Demo.
   */
  @Get('status')
  async getStatus(@Req() req: Request): Promise<AuthStatus> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const sessionId = cookies?.[SESSION_COOKIE_NAME];
    return this.authService.getAuthStatus(sessionId);
  }

  /**
   * Refresca los tokens de la sesión activa de forma transparente.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request): Promise<{ success: boolean }> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const sessionId = cookies?.[SESSION_COOKIE_NAME];
    if (!sessionId) {
      return { success: false };
    }
    await this.authService.refreshSession(sessionId);
    return { success: true };
  }

  /**
   * Cierra la sesión activa, revoca los tokens en memoria y destruye la cookie.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const sessionId = cookies?.[SESSION_COOKIE_NAME];
    await this.authService.logout(sessionId);

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({ success: true });
  }
}
