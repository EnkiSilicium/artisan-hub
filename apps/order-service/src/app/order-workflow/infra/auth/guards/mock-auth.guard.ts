import { CanActivate, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(): boolean {
    Logger.warn({
      message: `WARNING: auth disabled!`,
    });
    return true;
  }
}
