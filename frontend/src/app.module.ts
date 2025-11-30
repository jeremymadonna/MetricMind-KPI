import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      // Exclude API routes from static serving (compatible with path-to-regexp)
      exclude: ['/api', '/api/(.*)'],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
