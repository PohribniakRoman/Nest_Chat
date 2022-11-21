import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGeteway } from './chat.geteway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,ChatGeteway],
})
export class AppModule {}
