import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function start() {
  const PORT = `${process.env.API_URL || 5000}`;
  console.log(PORT);
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT,()=>{
    console.log(`Server has been started on port:${PORT}`);
  })
}
start();
