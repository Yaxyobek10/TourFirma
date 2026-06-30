import { Controller, Get, Headers, Ip, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CaselinkPackagesService } from './caselink-packages.service';

@ApiTags('CaseLink Public')
@Controller('public')
export class PublicPackagesController {
  constructor(private readonly packagesService: CaselinkPackagesService) {}

  @Get('packages/:slug')
  getPublicPackage(@Param('slug') slug: string) {
    return this.packagesService.getPublicPackage(slug);
  }

  @Get('packages/:slug/click')
  recordPackageClick(
    @Param('slug') slug: string,
    @Query('source') source: string | undefined,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ip: string,
  ) {
    return this.packagesService.recordClickBySlug(slug, source, userAgent, ip);
  }

  @Get('r/:token/click')
  recordTrackingClick(
    @Param('token') token: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Ip() ip: string,
  ) {
    return this.packagesService.recordClickByToken(token, userAgent, ip);
  }
}
