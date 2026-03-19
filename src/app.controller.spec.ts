import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = testingModule.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return the health payload', () => {
      const payload = appController.getHealth();

      expect(payload.status).toBe('ok');
      expect(payload.service).toBe('backend');
      expect(payload.timestamp).toEqual(expect.any(String));
    });
  });
});
