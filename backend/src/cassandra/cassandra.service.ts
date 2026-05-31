import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import { loadConfig } from '../config/cassandra.config';
import { MISSIONS } from '../missions/missions.catalog';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CassandraService.name);
  private client!: Client;
  private readonly config = loadConfig().cassandra;

  async onModuleInit(): Promise<void> {
    const retries = 20;
    const delayMs = 3000;
    this.logger.log(
      `Iniciando conexão com Cassandra em: ${this.config.contactPoints.join(
        ',',
      )} (DC: ${this.config.localDataCenter})`,
    );
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.bootstrap();
        this.logger.log('Cassandra pronto.');
        return;
      } catch (error) {
        if (attempt === retries) throw error;
        this.logger.warn(
          `Cassandra indisponível (tentativa ${attempt}/${retries}). ` +
            `Retentando em ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  private async bootstrap(): Promise<void> {
    const bootstrapClient = new Client({
      contactPoints: this.config.contactPoints,
      localDataCenter: this.config.localDataCenter,
    });
    try {
      await bootstrapClient.connect();
      await bootstrapClient.execute(
        `CREATE KEYSPACE IF NOT EXISTS ${this.config.keyspace} ` +
          `WITH replication = {'class':'SimpleStrategy','replication_factor':1}`,
      );
    } finally {
      await bootstrapClient.shutdown();
    }

    this.client = new Client({
      contactPoints: this.config.contactPoints,
      localDataCenter: this.config.localDataCenter,
      keyspace: this.config.keyspace,
    });
    await this.client.connect();
    await this.createTables();
    await this.seedMissions();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.shutdown();
  }

  execute(query: string, params: unknown[] = [], prepare = true) {
    return this.client.execute(query, params, { prepare });
  }

  private async createTables(): Promise<void> {
    const createTableStatements = [
      `CREATE TABLE IF NOT EXISTS users_by_nick (
         nickname text PRIMARY KEY, password_hash text, created_at timestamp)`,
      `CREATE TABLE IF NOT EXISTS score_by_nick (
         nickname text PRIMARY KEY, pcl int)`,
      `CREATE TABLE IF NOT EXISTS cagadas_by_user (
         nickname text, cagada_id timeuuid, mission_id text, level text,
         mission_text text, status text, pcl_delta int,
         created_at timestamp, resolved_at timestamp,
         PRIMARY KEY (nickname, cagada_id))
         WITH CLUSTERING ORDER BY (cagada_id DESC)`,
      `CREATE TABLE IF NOT EXISTS missions (
         mission_id text PRIMARY KEY, level text, text text)`,
      `CREATE TABLE IF NOT EXISTS friendships_by_user (
         owner_nick text, friend_nick text, created_at timestamp,
         PRIMARY KEY (owner_nick, friend_nick))`,
    ];
    for (const statement of createTableStatements)
      await this.client.execute(statement);
  }

  private async seedMissions(): Promise<void> {
    for (const mission of MISSIONS) {
      await this.client.execute(
        `INSERT INTO missions (mission_id, level, text) VALUES (?, ?, ?)`,
        [mission.id, mission.level, mission.text],
        { prepare: true },
      );
    }
  }

  timeuuidNow(): types.TimeUuid {
    return types.TimeUuid.now();
  }

  timeuuidFrom(id: string): types.TimeUuid {
    return types.TimeUuid.fromString(id);
  }
}
