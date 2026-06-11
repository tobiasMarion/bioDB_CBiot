import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoxService } from './box.service';
import { CreateBoxDTO } from './dto/CreateBox';
import { UpdateBoxDTO } from './dto/UpdateBox';

@Controller('box')
export class BoxController {
  constructor(private readonly boxService: BoxService) {}

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
