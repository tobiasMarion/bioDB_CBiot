import { Injectable } from '@nestjs/common';
import { CreateRoomDTO } from './dto/CreateRoom';
import { UpdateRoomDTO } from './dto/UpdateRoom';

@Injectable()
export class RoomsService {
  create(createRoomDto: CreateRoomDTO) {
    return 'This action adds a new room';
  }

  findAll() {
    return `This action returns all rooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDTO) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
