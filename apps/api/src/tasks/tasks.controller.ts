import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';

@ApiTags('Tasks')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a task in one of the caller's projects" })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not owned by caller',
  })
  create(@CurrentUser() userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List tasks in the caller's workspace, paginated" })
  findAll(@CurrentUser() userId: string, @Query() query: ListTasksQueryDto) {
    return this.tasksService.findAllForUser(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by id' })
  @ApiResponse({
    status: 404,
    description: 'Task not found or not owned by caller',
  })
  findOne(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.findOneForUser(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a task's fields" })
  @ApiResponse({
    status: 404,
    description: 'Task not found or not owned by caller',
  })
  update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  @ApiResponse({
    status: 404,
    description: 'Task not found or not owned by caller',
  })
  remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.remove(userId, id);
  }
}
