export interface PaymentGateway {
  createTransaction(amount: number, bookingId: number): Promise<{
    transactionId: string;
    redirectUrl?: string;
  }>;
  verifyTransaction(transactionId: string): Promise<boolean>;
}
