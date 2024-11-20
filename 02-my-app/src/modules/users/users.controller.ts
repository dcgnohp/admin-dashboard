import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '@/decorator/meta-data';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  async findAll(
    @Query() query: string,
    @Query('current') currentPage: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.usersService.findAll(query, +currentPage, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
