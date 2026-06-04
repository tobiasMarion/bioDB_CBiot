import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDTO } from './CreateRoom';

export class UpdateRoomDTO extends PartialType(CreateRoomDTO) {}
