import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { CreateBoxDTO } from './dto/CreateBox';
import { UpdateBoxDTO } from './dto/UpdateBox';

@Controller('box')
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  @Post()
  create(@Body() CreateBoxDTO: CreateBoxDTO) {
    return this.boxService.create(CreateBoxDTO);
  }

  @Get()
  findAll() {
    return this.boxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateBoxDTO: UpdateBoxDTO) {
    return this.boxService.update(+id, UpdateBoxDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boxService.remove(+id);
  }
}
