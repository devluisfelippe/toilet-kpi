import { Client, types } from 'cassandra-driver';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually — no NestJS bootstrap needed
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}

const CONTACT_POINTS = (
  process.env.CASSANDRA_CONTACT_POINTS ?? '127.0.0.1'
).split(',');
const LOCAL_DC = process.env.CASSANDRA_LOCAL_DC ?? 'datacenter1';
const KEYSPACE = process.env.CASSANDRA_KEYSPACE ?? 'toilet_kpi';

// ─── seed data ───────────────────────────────────────────────────────────────

const USERS = [
  { nickname: 'joao', password: 'senha123' },
  { nickname: 'maria', password: 'senha123' },
  { nickname: 'carlos', password: 'senha123' },
];

const PCL_DELTA: Record<string, Record<string, number>> = {
  leve: { cumprida: 10, falhou: -5, pulou: 0 },
  medio: { cumprida: 30, falhou: -10, pulou: 0 },
  insano: { cumprida: 70, falhou: -20, pulou: 0 },
};

interface CagadaSeed {
  nickname: string;
  missionId: string;
  level: string;
  missionText: string;
  status: 'cumprida' | 'falhou' | 'pulou';
}

const CAGADAS: CagadaSeed[] = [
  // joao — 10 + 30 - 20 + 0 = 20 PCL
  {
    nickname: 'joao',
    missionId: '1',
    level: 'leve',
    missionText: 'Se limpe com papel higiênico triplo, macio feito nuvem.',
    status: 'cumprida',
  },
  {
    nickname: 'joao',
    missionId: '4',
    level: 'medio',
    missionText: 'Use exatamente uma folha de papel, nem mais nem menos.',
    status: 'cumprida',
  },
  {
    nickname: 'joao',
    missionId: '7',
    level: 'insano',
    missionText: 'Lave-se no rio mais próximo após o ritual.',
    status: 'falhou',
  },
  {
    nickname: 'joao',
    missionId: '2',
    level: 'leve',
    missionText: 'Cante uma música de sua escolha do início ao fim.',
    status: 'pulou',
  },
  // maria — 70 + 30 - 5 + 0 = 95 PCL
  {
    nickname: 'maria',
    missionId: '7',
    level: 'insano',
    missionText: 'Lave-se no rio mais próximo após o ritual.',
    status: 'cumprida',
  },
  {
    nickname: 'maria',
    missionId: '4',
    level: 'medio',
    missionText: 'Use exatamente uma folha de papel, nem mais nem menos.',
    status: 'cumprida',
  },
  {
    nickname: 'maria',
    missionId: '2',
    level: 'leve',
    missionText: 'Cante uma música de sua escolha do início ao fim.',
    status: 'falhou',
  },
  {
    nickname: 'maria',
    missionId: '5',
    level: 'medio',
    missionText: 'Termine em menos de 90 segundos, cronometrado.',
    status: 'pulou',
  },
  // carlos — 10 - 5 + 30 + 70 = 105 PCL
  {
    nickname: 'carlos',
    missionId: '1',
    level: 'leve',
    missionText: 'Se limpe com papel higiênico triplo, macio feito nuvem.',
    status: 'cumprida',
  },
  {
    nickname: 'carlos',
    missionId: '2',
    level: 'leve',
    missionText: 'Cante uma música de sua escolha do início ao fim.',
    status: 'falhou',
  },
  {
    nickname: 'carlos',
    missionId: '4',
    level: 'medio',
    missionText: 'Use exatamente uma folha de papel, nem mais nem menos.',
    status: 'cumprida',
  },
  {
    nickname: 'carlos',
    missionId: '7',
    level: 'insano',
    missionText: 'Lave-se no rio mais próximo após o ritual.',
    status: 'cumprida',
  },
];

// Mutual friendships — both directions
const FRIENDSHIPS = [
  ['joao', 'maria'],
  ['maria', 'joao'],
  ['joao', 'carlos'],
  ['carlos', 'joao'],
  ['maria', 'carlos'],
  ['carlos', 'maria'],
];

function calcPcl(nickname: string): number {
  return CAGADAS.filter((c) => c.nickname === nickname).reduce(
    (total, c) => Math.max(0, total + PCL_DELTA[c.level][c.status]),
    0,
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🚽 Conectando ao Cassandra...');
  const client = new Client({
    contactPoints: CONTACT_POINTS,
    localDataCenter: LOCAL_DC,
    keyspace: KEYSPACE,
  });
  await client.connect();
  console.log(`✅ Conectado (keyspace: ${KEYSPACE})\n`);

  console.log('🧹 Limpando dados anteriores...');
  for (const { nickname } of USERS) {
    await client.execute(
      'DELETE FROM users_by_nick       WHERE nickname   = ?',
      [nickname],
      { prepare: true },
    );
    await client.execute(
      'DELETE FROM score_by_nick       WHERE nickname   = ?',
      [nickname],
      { prepare: true },
    );
    await client.execute(
      'DELETE FROM cagadas_by_user     WHERE nickname   = ?',
      [nickname],
      { prepare: true },
    );
    await client.execute(
      'DELETE FROM friendships_by_user WHERE owner_nick = ?',
      [nickname],
      { prepare: true },
    );
  }

  console.log('👤 Criando usuários...');
  for (const { nickname, password } of USERS) {
    const hash = await bcrypt.hash(password, 10);
    await client.execute(
      'INSERT INTO users_by_nick (nickname, password_hash, created_at) VALUES (?, ?, ?)',
      [nickname, hash, new Date()],
      { prepare: true },
    );
    console.log(`   ✓ ${nickname}`);
  }

  console.log('\n💩 Inserindo cagadas...');
  for (const c of CAGADAS) {
    const delta = PCL_DELTA[c.level][c.status];
    await client.execute(
      `INSERT INTO cagadas_by_user
         (nickname, cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.nickname,
        types.TimeUuid.now(),
        c.missionId,
        c.level,
        c.missionText,
        c.status,
        delta,
        new Date(),
        new Date(),
      ],
      { prepare: true },
    );
  }
  console.log(`   ✓ ${CAGADAS.length} cagadas inseridas`);

  console.log('\n🏆 Calculando scores...');
  for (const { nickname } of USERS) {
    const pcl = calcPcl(nickname);
    await client.execute(
      'INSERT INTO score_by_nick (nickname, pcl) VALUES (?, ?)',
      [nickname, pcl],
      { prepare: true },
    );
    console.log(`   ✓ ${nickname}: ${pcl} PCL`);
  }

  console.log('\n🤝 Criando amizades...');
  for (const [owner, friend] of FRIENDSHIPS) {
    await client.execute(
      'INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)',
      [owner, friend, new Date()],
      { prepare: true },
    );
  }
  console.log('   ✓ joao ↔ maria ↔ carlos');

  await client.shutdown();

  console.log('\n┌──────────────┬───────┬──────────┐');
  console.log('│ Usuário      │  PCL  │ Senha    │');
  console.log('├──────────────┼───────┼──────────┤');
  for (const { nickname, password } of USERS) {
    console.log(
      `│ ${nickname.padEnd(12)} │ ${String(calcPcl(nickname)).padEnd(5)} │ ${password.padEnd(8)} │`,
    );
  }
  console.log('└──────────────┴───────┴──────────┘');
  console.log('\n✅ Seed concluído!');
}

seed().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
