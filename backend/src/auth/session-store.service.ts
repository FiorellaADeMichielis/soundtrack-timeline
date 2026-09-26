import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

export interface UserSessionData {
  readonly sessionId: string;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt: number;
  readonly userId: string;
  readonly displayName: string;
}

interface InMemoryEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
}

@Injectable()
export class SessionStoreService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionStoreService.name);
  private redisClient: Redis | null = null;
  private readonly memoryStore = new Map<string, InMemoryEntry<unknown>>();

  onModuleInit(): void {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    // Solo inicializar Redis si se definió explícitamente en el entorno y no es entorno de pruebas
    if (host && process.env.NODE_ENV !== 'test') {
      try {
        this.redisClient = new Redis({
          host,
          port,
          password,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
        });

        this.redisClient.connect().catch(() => {
          this.logger.warn(
            'No se pudo conectar a Redis. Activando almacenamiento efímero en memoria (Modo Ley 25.326)',
          );
          this.redisClient = null;
        });
      } catch {
        this.logger.warn('Error instanciando cliente Redis. Usando almacenamiento en memoria.');
        this.redisClient = null;
      }
    } else {
      this.logger.log('Almacenamiento de sesiones en memoria RAM inicializado.');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => {});
      this.redisClient = null;
    }
    this.memoryStore.clear();
  }

  // ==========================================
  // ESTADO FLUJO OAUTH2 (code_verifier + state)
  // ==========================================

  async saveOAuthState(
    state: string,
    codeVerifier: string,
    ttlSeconds: number = 600,
  ): Promise<void> {
    const key = `oauth:state:${state}`;
    if (this.redisClient && this.redisClient.status === 'ready') {
      await this.redisClient.set(key, codeVerifier, 'EX', ttlSeconds);
    } else {
      this.memoryStore.set(key, {
        data: codeVerifier,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async getAndConsumeOAuthVerifier(state: string): Promise<string | null> {
    const key = `oauth:state:${state}`;
    if (this.redisClient && this.redisClient.status === 'ready') {
      const verifier = await this.redisClient.get(key);
      if (verifier) {
        await this.redisClient.del(key);
      }
      return verifier;
    } else {
      const entry = this.memoryStore.get(key) as InMemoryEntry<string> | undefined;
      if (!entry) {
        return null;
      }
      this.memoryStore.delete(key);
      if (Date.now() > entry.expiresAt) {
        return null;
      }
      return entry.data;
    }
  }

  // ==========================================
  // SESIONES DE USUARIO AUTENTICADO
  // ==========================================

  async saveSession(
    sessionId: string,
    session: UserSessionData,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    const key = `session:${sessionId}`;
    if (this.redisClient && this.redisClient.status === 'ready') {
      await this.redisClient.set(key, JSON.stringify(session), 'EX', ttlSeconds);
    } else {
      this.memoryStore.set(key, {
        data: session,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async getSession(sessionId: string): Promise<UserSessionData | null> {
    const key = `session:${sessionId}`;
    if (this.redisClient && this.redisClient.status === 'ready') {
      const raw = await this.redisClient.get(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as UserSessionData;
      } catch {
        return null;
      }
    } else {
      const entry = this.memoryStore.get(key) as InMemoryEntry<UserSessionData> | undefined;
      if (!entry) {
        return null;
      }
      if (Date.now() > entry.expiresAt) {
        this.memoryStore.delete(key);
        return null;
      }
      return entry.data;
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    if (this.redisClient && this.redisClient.status === 'ready') {
      await this.redisClient.del(key);
    } else {
      this.memoryStore.delete(key);
    }
  }
}
