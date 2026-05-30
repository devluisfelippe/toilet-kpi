import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule (wiring)', () => {
  it('resolve o grafo de dependências sem conectar ao Cassandra', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
