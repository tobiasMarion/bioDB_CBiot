import { PartialType } from '@nestjs/swagger';
import { CreateSampleDTO } from './CreateSample';


export class UpdateSampleDTO extends PartialType(CreateSampleDTO) {}