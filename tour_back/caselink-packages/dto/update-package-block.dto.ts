import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageBlockDto } from './create-package-block.dto';

export class UpdatePackageBlockDto extends PartialType(CreatePackageBlockDto) {}
