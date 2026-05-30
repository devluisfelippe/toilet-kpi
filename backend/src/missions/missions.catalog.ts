import { Nivel } from '../domain/scoring';

export interface Missao {
  id: string;
  level: Nivel;
  text: string;
}

export const MISSOES: ReadonlyArray<Missao> = [
  {
    id: 'leve-origami',
    level: 'leve',
    text: 'Folha única. Tipo origami. Você consegue.',
  },
  {
    id: 'leve-dobre',
    level: 'leve',
    text: 'Dobre, não amasse. Respeite o recurso.',
  },
  {
    id: 'leve-sopro',
    level: 'leve',
    text: 'Só um sopro de papel. O resto é coragem.',
  },
  { id: 'medio-bide', level: 'medio', text: 'Encare o bidê do destino.' },
  {
    id: 'medio-ducha',
    level: 'medio',
    text: 'Ducha higiênica, guerreiro. Sem medo.',
  },
  {
    id: 'medio-torneira',
    level: 'medio',
    text: 'Jato da torneira, igual nobre de 1700.',
  },
  {
    id: 'insano-rio',
    level: 'insano',
    text: 'Lave-se no rio mais próximo (ou na sua imaginação).',
  },
  {
    id: 'insano-bananeira',
    level: 'insano',
    text: 'Folha de bananeira: volte às origens.',
  },
  {
    id: 'insano-mangueira',
    level: 'insano',
    text: 'Mangueira do quintal, pela glória.',
  },
];
