import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatGeteway } from './chat.geteway';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [],
  providers: [ChatGeteway],
})
export class AppModule {}
