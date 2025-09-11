import { Injectable } from '@nestjs/common';
import { PaymentGateway } from './gateway-interface';

@Injectable()
export class PaymeService implements PaymentGateway {
  async createTransaction(amount: number, bookingId: number) {
    const transactionId = 'payme_' + Date.now();
    return {
      transactionId,
      redirectUrl: `https://checkout.paycom.uz/${transactionId}`,
    };
  }
  async verifyTransaction(transactionId: string): Promise<boolean> {
    return true;
  }
}
