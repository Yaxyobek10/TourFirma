import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '../entities/lead.entity';

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: LeadStatus, example: LeadStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
