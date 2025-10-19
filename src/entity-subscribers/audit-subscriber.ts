import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  type UpdateEvent,
} from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity.ts';
import { generateHash } from '../common/utils.ts';
import { SYSTEM_USER_ID } from '../constants/const.ts';
import { RequestContext } from '../context/request-context.ts';
import { UserEntity } from '../modules/user/user.entity.ts';

@EventSubscriber()
export class AuditSubscriber
  implements EntitySubscriberInterface<AbstractEntity>
{
  listenTo() {
    // Lắng nghe tất cả entity kế thừa từ AbstractEntity
    return AbstractEntity;
  }

  /**
   * Xử lý trước khi insert
   */
  beforeInsert(event: InsertEvent<AbstractEntity>): void {
    const user = RequestContext.currentUser();

    // 🔹 Nếu là UserEntity → hash password
    if (event.entity instanceof UserEntity && event.entity.password) {
      event.entity.password = generateHash(event.entity.password);
    }

    // 🔹 Audit fields
    event.entity.createdById = user?.id ?? SYSTEM_USER_ID;
    event.entity.updatedById = user?.id ?? SYSTEM_USER_ID;
  }

  /**
   * Xử lý trước khi update
   */
  beforeUpdate(event: UpdateEvent<AbstractEntity>): void {
    const user = RequestContext.currentUser();

    // 🔹 Nếu là UserEntity → hash lại password nếu thay đổi
    if (event.entity instanceof UserEntity) {
      const entity = event.entity;
      const old = event.databaseEntity as UserEntity | undefined;

      if (entity.password && old && entity.password !== old.password) {
        entity.password = generateHash(entity.password);
      }
    }

    // 🔹 Audit fields
    if (event.entity) {
      event.entity.updatedById = user?.id ?? SYSTEM_USER_ID;
    }
  }
}
