import { Controller, Post, Body } from '@nestjs/common';

@Controller('payments/webhooks')
export class WebhooksController {
  @Post('click')
  handleClick(@Body() payload: any) {
    console.log('Click webhook:', payload);
    return { success: true };
  }

  @Post('payme')
  handlePayme(@Body() payload: any) {
    console.log('Payme webhook:', payload);
    return { success: true };
  }
}
