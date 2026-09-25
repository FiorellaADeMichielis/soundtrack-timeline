import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('debe retornar status "ok" y timestamp ISO válido', () => {
      const response = appController.getHealth();
      expect(response.status).toBe('ok');
      expect(typeof response.timestamp).toBe('string');
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
      expect(response.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });
});
