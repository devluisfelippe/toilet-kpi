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
  constructor(private readonly db: CassandraService) {}

  private toCagada(row: unknown): CagadaRow {
    const r = row as RawCagadaRow;
    return {
      cagada_id: r.cagada_id.toString(),
      mission_id: r.mission_id,
      level: r.level,
      mission_text: r.mission_text,
      status: r.status,
      pcl_delta: Number(r.pcl_delta),
      created_at: r.created_at,
      resolved_at: r.resolved_at ?? null,
    };
  }

  async insertPending(nickname: string, missao: Missao): Promise<string> {
    const id = this.db.timeuuidNow();
    await this.db.execute(
      `INSERT INTO cagadas_by_user
         (nickname, cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, 'pendente', 0, ?, null)`,
      [nickname, id, missao.id, missao.level, missao.text, new Date()],
    );
    return id.toString();
  }

  async findById(
    nickname: string,
    cagadaId: string,
  ): Promise<CagadaRow | null> {
    const rs = await this.db.execute(
      `SELECT cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas_by_user WHERE nickname = ? AND cagada_id = ?`,
      [nickname, this.db.timeuuidFrom(cagadaId)],
    );
    const row = rs.first();
    if (!row) return null;
    return this.toCagada(row);
  }

  async resolve(
    nickname: string,
    cagadaId: string,
    status: string,
    pclDelta: number,
  ): Promise<void> {
    await this.db.execute(
      `UPDATE cagadas_by_user SET status = ?, pcl_delta = ?, resolved_at = ?
         WHERE nickname = ? AND cagada_id = ?`,
      [status, pclDelta, new Date(), nickname, this.db.timeuuidFrom(cagadaId)],
    );
  }

  async recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const rs = await this.db.execute(
      `SELECT cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas_by_user WHERE nickname = ? LIMIT ?`,
      [nickname, limit],
    );
    return rs.rows.map((row) => this.toCagada(row));
  }
}
