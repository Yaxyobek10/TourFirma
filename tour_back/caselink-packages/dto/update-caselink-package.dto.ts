import { PartialType } from '@nestjs/mapped-types';
import { CreateCaselinkPackageDto } from './create-caselink-package.dto';

export class UpdateCaselinkPackageDto extends PartialType(CreateCaselinkPackageDto) {}
