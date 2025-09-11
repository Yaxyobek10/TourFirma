import { PartialType } from '@nestjs/swagger';
import { CreateTourFirmaDto } from './create-tourfirma.dto';

export class UpdateTourFirmaDto extends PartialType(CreateTourFirmaDto) {}
