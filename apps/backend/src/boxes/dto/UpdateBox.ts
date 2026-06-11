import { PartialType } from '@nestjs/mapped-types';
import { CreateBoxDTO } from './CreateBox';

export class UpdateBoxDTO extends PartialType(CreateBoxDTO) {}
