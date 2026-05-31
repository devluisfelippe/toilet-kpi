export interface AppConfig {
  port: number;
  database: { file: string };
  jwt: { secret: string; expiresIn: string };
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    database: {
      file: process.env.DATABASE_FILE ?? './data/toilet_kpi.db',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
  };
}
