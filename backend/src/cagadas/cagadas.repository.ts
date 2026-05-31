import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
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
  id: string;
  mission_id: string;
  level: string;
  mission_text: string;
  status: string;
  pcl_delta: number;
  created_at: string;
  resolved_at: string | null;
}

@Injectable()
export class CagadasRepository {
  constructor(private readonly database: DatabaseService) {}

  private toCagada(row: RawCagadaRow): CagadaRow {
    return {
      cagada_id: row.id,
      mission_id: row.mission_id,
      level: row.level,
      mission_text: row.mission_text,
      status: row.status,
      pcl_delta: Number(row.pcl_delta),
      created_at: new Date(row.created_at),
      resolved_at: row.resolved_at ? new Date(row.resolved_at) : null,
    };
  }

  insertPending(nickname: string, missao: Missao): Promise<string> {
    const id = randomUUID();
    this.database.run(
      `INSERT INTO cagadas
         (id, nickname, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, 'pendente', 0, ?, NULL)`,
      [
        id,
        nickname,
        missao.id,
        missao.level,
        missao.text,
        new Date().toISOString(),
      ],
    );
    return Promise.resolve(id);
  }

  findById(nickname: string, cagadaId: string): Promise<CagadaRow | null> {
    const row = this.database.get<RawCagadaRow>(
      `SELECT id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas WHERE nickname = ? AND id = ?`,
      [nickname, cagadaId],
    );
    return Promise.resolve(row ? this.toCagada(row) : null);
  }

  resolve(
    nickname: string,
    cagadaId: string,
    status: string,
    pclDelta: number,
  ): Promise<void> {
    this.database.run(
      `UPDATE cagadas SET status = ?, pcl_delta = ?, resolved_at = ?
         WHERE nickname = ? AND id = ?`,
      [status, pclDelta, new Date().toISOString(), nickname, cagadaId],
    );
    return Promise.resolve();
  }

  recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const rows = this.database.all<RawCagadaRow>(
      `SELECT id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas WHERE nickname = ? ORDER BY rowid DESC LIMIT ?`,
      [nickname, limit],
    );
    return Promise.resolve(rows.map((row) => this.toCagada(row)));
  }
}
