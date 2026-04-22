import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import {
  OptionalJwtAuthGuard,
  type JwtRequestUser,
} from 'src/auth/guard/optional-jwt-auth.guard';
import { CreatePublicationCommentDto } from './dto/create-publication-comment.dto';
import { EditorialService } from './editorial.service';

type ReqWithUser = Request & { user?: JwtRequestUser };

@Controller('feed')
export class FeedController {
  constructor(private readonly editorialService: EditorialService) {}

  @Get('posts')
  @UseGuards(OptionalJwtAuthGuard)
  listPosts(@Req() req: ReqWithUser) {
    return this.editorialService.listPublicFeed(100, req.user?.userId);
  }

  @Post('posts/:publicationId/like')
  @UseGuards(JwtAuthGuard)
  togglePublicationLike(
    @Param('publicationId') publicationId: string,
    @Req() req: Request & { user: JwtRequestUser },
  ) {
    return this.editorialService.togglePublicationLike(
      req.user.userId,
      publicationId,
    );
  }

  @Get('posts/:publicationId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  listComments(
    @Param('publicationId') publicationId: string,
    @Req() req: ReqWithUser,
  ) {
    const viewerId = req.user?.userId;
    return this.editorialService.listPublicationComments(
      publicationId,
      viewerId,
    );
  }

  @Post('posts/:publicationId/comments')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('publicationId') publicationId: string,
    @Body() dto: CreatePublicationCommentDto,
    @Req() req: Request & { user: JwtRequestUser },
  ) {
    return this.editorialService.createPublicationComment(
      req.user.userId,
      publicationId,
      dto.text,
    );
  }

  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Param('commentId') commentId: string,
    @Req() req: Request & { user: JwtRequestUser },
  ) {
    return this.editorialService.togglePublicationCommentLike(
      req.user.userId,
      commentId,
    );
  }

  @Get('me/comments')
  @UseGuards(JwtAuthGuard)
  listMyComments(@Req() req: Request & { user: JwtRequestUser }) {
    return this.editorialService.listMyComments(req.user.userId);
  }
}
