import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    this.$connect().catch((err) => {
      console.warn(
        '⚠️ Note: PostgreSQL at localhost:5432 is not currently connected. Run `docker compose up -d` to activate database.',
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
