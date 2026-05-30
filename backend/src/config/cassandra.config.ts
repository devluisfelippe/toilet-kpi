export interface AppConfig {
  port: number;
  cassandra: {
    contactPoints: string[];
    localDataCenter: string;
    keyspace: string;
  };
  jwt: { secret: string; expiresIn: string };
  corsOrigin: string;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    cassandra: {
      contactPoints: (
        process.env.CASSANDRA_CONTACT_POINTS ?? '127.0.0.1'
      ).split(','),
      localDataCenter: process.env.CASSANDRA_LOCAL_DC ?? 'datacenter1',
      keyspace: process.env.CASSANDRA_KEYSPACE ?? 'toilet_kpi',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  };
}
