import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('Projects')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Create a project in the caller's workspace" })
  @ApiResponse({ status: 201, description: 'Project created' })
  create(@CurrentUser() userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List all projects in the caller's workspace" })
  findAll(@CurrentUser() userId: string) {
    return this.projectsService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project by id' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by caller',
  })
  findOne(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findOneForUser(userId, id);
  }
}
