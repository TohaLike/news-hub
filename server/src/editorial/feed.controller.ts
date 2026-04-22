import { Controller, Get } from '@nestjs/common';
import { EditorialService } from './editorial.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly editorialService: EditorialService) {}

  @Get('posts')
  listPosts() {
    return this.editorialService.listPublicFeed();
  }
}
