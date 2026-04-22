import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { EditorialController } from './editorial.controller';
import { FeedController } from './feed.controller';
import { EditorialService } from './editorial.service';
import {
  EditorialGroup,
  EditorialGroupSchema,
} from './schemas/editorial-group.schema';
import {
  GroupPublication,
  GroupPublicationSchema,
} from './schemas/group-publication.schema';
import {
  PublicationComment,
  PublicationCommentSchema,
} from './schemas/publication-comment.schema';
import {
  GroupPublicationView,
  GroupPublicationViewSchema,
} from './schemas/group-publication-view.schema';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: EditorialGroup.name, schema: EditorialGroupSchema },
      { name: GroupPublication.name, schema: GroupPublicationSchema },
      { name: PublicationComment.name, schema: PublicationCommentSchema },
      { name: GroupPublicationView.name, schema: GroupPublicationViewSchema },
    ]),
  ],
  controllers: [EditorialController, FeedController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
