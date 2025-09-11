import { Injectable } from '@nestjs/common';
import { PaymentGateway } from './gateway-interface';

@Injectable()
export class ClickService implements PaymentGateway {
  async createTransaction(amount: number, bookingId: number) {
    const transactionId = 'click_' + Date.now();
    return {
      transactionId,
      redirectUrl: `https://my.click.uz/pay?transaction_id=${transactionId}`,
    };
  }
  async verifyTransaction(transactionId: string): Promise<boolean> {
    return true;
  }
}
