import { Module } from '@nestjs/common';
import { BeauticianWebService } from './beautician-web.service';
import { BeauticianWebController } from './beautician-web.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [BeauticianWebController],
  providers: [BeauticianWebService],
  exports: [BeauticianWebService],
})
export class BeauticianWebModule {}
