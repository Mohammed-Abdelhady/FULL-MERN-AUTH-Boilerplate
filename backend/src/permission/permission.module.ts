import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionSchema } from './schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Permission', schema: PermissionSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PermissionModule {}
