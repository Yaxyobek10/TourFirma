import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'Booking ID to pay for' })
  @IsNumber()
  bookingId: number;

  @ApiProperty({ example: 150, description: 'Amount to pay' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
    description: 'Payment method: cash, card, or online',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({
    example: 'txn_123456',
    description: 'Transaction ID (required for card/online payments)',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
