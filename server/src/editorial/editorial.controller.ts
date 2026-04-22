import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PublisherGuard } from 'src/auth/guard/publisher.guard';
import { CreateEditorialGroupDto } from './dto/create-editorial-group.dto';
import { CreateGroupPublicationDto } from './dto/create-group-publication.dto';
import { EditorialService } from './editorial.service';

type JwtUser = {
  userId: string;
  email: string;
  name: string;
  role: string;
};

@Controller('publisher')
@UseGuards(JwtAuthGuard, PublisherGuard)
export class EditorialController {
  constructor(private readonly editorialService: EditorialService) {}

  @Post('groups')
  createGroup(@Req() req: { user: JwtUser }, @Body() dto: CreateEditorialGroupDto) {
    return this.editorialService.createGroup(req.user.userId, dto);
  }

  @Get('groups')
  listGroups(@Req() req: { user: JwtUser }) {
    return this.editorialService.listGroups(req.user.userId);
  }

  @Get('groups/:groupId')
  getGroup(
    @Req() req: { user: JwtUser },
    @Param('groupId') groupId: string,
  ) {
    return this.editorialService.getGroup(req.user.userId, groupId);
  }

  @Post('groups/:groupId/publications')
  createPublication(
    @Req() req: { user: JwtUser },
    @Param('groupId') groupId: string,
    @Body() dto: CreateGroupPublicationDto,
  ) {
    return this.editorialService.createPublication(
      req.user.userId,
      groupId,
      dto,
    );
  }

  @Get('groups/:groupId/publications')
  listPublications(
    @Req() req: { user: JwtUser },
    @Param('groupId') groupId: string,
  ) {
    return this.editorialService.listPublications(req.user.userId, groupId);
  }
}
