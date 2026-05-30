import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';
import { Missao } from '../missions/missions.catalog';

export interface CagadaRow {
  cagada_id: string;
  mission_id: string;
  level: string;
  mission_text: string;
  status: string;
  pcl_delta: number;
  created_at: Date;
  resolved_at: Date | null;
}

interface RawCagadaRow {
  cagada_id: { toString(): string };
  mission_id: string;
  level: string;
  mission_text: string;
  status: string;
  pcl_delta: number;
  created_at: Date;
  resolved_at: Date | null;
}

@Injectable()
export class CagadasRepository {
  constructor(private readonly cassandra: CassandraService) {}

  private toCagada(row: unknown): CagadaRow {
    const rawRow = row as RawCagadaRow;
    return {
      cagada_id: rawRow.cagada_id.toString(),
      mission_id: rawRow.mission_id,
      level: rawRow.level,
      mission_text: rawRow.mission_text,
      status: rawRow.status,
      pcl_delta: Number(rawRow.pcl_delta),
      created_at: rawRow.created_at,
      resolved_at: rawRow.resolved_at ?? null,
    };
  }

  async insertPending(nickname: string, missao: Missao): Promise<string> {
    const cagadaId = this.cassandra.timeuuidNow();
    await this.cassandra.execute(
      `INSERT INTO cagadas_by_user
         (nickname, cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, 'pendente', 0, ?, null)`,
      [nickname, cagadaId, missao.id, missao.level, missao.text, new Date()],
    );
    return cagadaId.toString();
  }

  async findById(
    nickname: string,
    cagadaId: string,
  ): Promise<CagadaRow | null> {
    const resultSet = await this.cassandra.execute(
      `SELECT cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas_by_user WHERE nickname = ? AND cagada_id = ?`,
      [nickname, this.cassandra.timeuuidFrom(cagadaId)],
    );
    const row = resultSet.first();
    if (!row) return null;
    return this.toCagada(row);
  }

  async resolve(
    nickname: string,
    cagadaId: string,
    status: string,
    pclDelta: number,
  ): Promise<void> {
    await this.cassandra.execute(
      `UPDATE cagadas_by_user SET status = ?, pcl_delta = ?, resolved_at = ?
         WHERE nickname = ? AND cagada_id = ?`,
      [
        status,
        pclDelta,
        new Date(),
        nickname,
        this.cassandra.timeuuidFrom(cagadaId),
      ],
    );
  }

  async recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const resultSet = await this.cassandra.execute(
      `SELECT cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas_by_user WHERE nickname = ? LIMIT ?`,
      [nickname, limit],
    );
    return resultSet.rows.map((row) => this.toCagada(row));
  }
}
