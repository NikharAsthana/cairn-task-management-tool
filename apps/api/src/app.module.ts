import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

// ConfigModule.forRoot() loads .env into process.env, available app-wide

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
