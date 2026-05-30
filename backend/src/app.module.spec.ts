import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule (wiring)', () => {
  // compile() instancia todos os providers/controllers (validando os forwardRef
  // Users <-> Auth <-> Cagadas) sem disparar o onModuleInit do CassandraService,
  // então o grafo de DI é verificado sem precisar de um Cassandra no ar.
  it('resolve o grafo de dependências sem conectar ao Cassandra', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
