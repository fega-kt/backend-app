// src/context/request-context.ts
import { AsyncLocalStorage } from 'node:async_hooks';
import type { UserEntity } from '../modules/user/user.entity';

export class RequestContext {
  private static storage = new AsyncLocalStorage<{ user: UserEntity }>();

  static run(fn: () => unknown, user: UserEntity) {
    return this.storage.run({ user }, fn);
  }

  static currentUser(): UserEntity | undefined {
    return this.storage.getStore()?.user;
  }
}
