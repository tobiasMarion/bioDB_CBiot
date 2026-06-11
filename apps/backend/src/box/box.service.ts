import { Injectable } from '@nestjs/common';
import { CreateBoxDTO } from './dto/CreateBox';
import { UpdateBoxDTO } from './dto/UpdateBox';

@Injectable()
export class BoxService {
  create(CreateBoxDTO: CreateBoxDTO) {
    return 'This action adds a new box';
  }

  findAll() {
    return `This action returns all box`;
  }

  findOne(id: number) {
    return `This action returns a #${id} box`;
  }

  update(id: number, UpdateBoxDTO: UpdateBoxDTO) {
    return `This action updates a #${id} box`;
  }

  remove(id: number) {
    return `This action removes a #${id} box`;
  }
}
