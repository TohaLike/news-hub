import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';
import {
  EditorialGroup,
  EditorialGroupSchema,
} from './schemas/editorial-group.schema';
import {
  GroupPublication,
  GroupPublicationSchema,
} from './schemas/group-publication.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EditorialGroup.name, schema: EditorialGroupSchema },
      { name: GroupPublication.name, schema: GroupPublicationSchema },
    ]),
  ],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
