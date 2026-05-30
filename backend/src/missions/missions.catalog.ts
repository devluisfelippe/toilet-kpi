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
  {
    id: 'leve-tres-quadrados',
    level: 'leve',
    text: 'Três quadradinhos contados. Nem um a mais.',
  },
  {
    id: 'leve-reciclado',
    level: 'leve',
    text: 'Papel reciclado, macio e consciente.',
  },
  {
    id: 'leve-dobradura',
    level: 'leve',
    text: 'Dobre em quatro, como um pergaminho sagrado.',
  },
  {
    id: 'leve-sem-celular',
    level: 'leve',
    text: 'Sem celular no trono. Só você e o vazio.',
  },
  {
    id: 'leve-olhos-fechados',
    level: 'leve',
    text: 'De olhos fechados. Confie na Força.',
  },
  {
    id: 'leve-hino',
    level: 'leve',
    text: 'Cante o hino nacional inteiro, sem pressa.',
  },
  {
    id: 'leve-dois-minutos',
    level: 'leve',
    text: 'Resolva tudo em menos de dois minutos.',
  },
  {
    id: 'leve-mao-trocada',
    level: 'leve',
    text: 'Use só a mão não-dominante. Modo difícil leve.',
  },
  {
    id: 'leve-silencio',
    level: 'leve',
    text: 'Operação silenciosa: ninguém pode ouvir.',
  },
  {
    id: 'leve-poesia',
    level: 'leve',
    text: 'Recite uma poesia enquanto reflete no trono.',
  },
  {
    id: 'leve-respiracao',
    level: 'leve',
    text: 'Respiração diafragmática. Paz interior absoluta.',
  },
  {
    id: 'leve-guardanapo',
    level: 'leve',
    text: 'Um guardanapo de festa salva o dia.',
  },
  {
    id: 'leve-folha-menta',
    level: 'leve',
    text: 'Folha de menta: frescor ousado, porém suave.',
  },
  {
    id: 'leve-papel-pao',
    level: 'leve',
    text: 'Papel de pão da padaria. Crocante de leve.',
  },
  {
    id: 'leve-lenco-vovo',
    level: 'leve',
    text: 'Lenço de pano da vovó. Vintage e digno.',
  },
  {
    id: 'leve-economia',
    level: 'leve',
    text: 'Economize papel como se fosse ouro puro.',
  },
  {
    id: 'leve-assobio',
    level: 'leve',
    text: 'Assobie uma música inteira sem desafinar.',
  },
  {
    id: 'leve-meia-folha',
    level: 'leve',
    text: 'Meia folha. Metade do papel, dobro da fé.',
  },
  {
    id: 'leve-papel-macio',
    level: 'leve',
    text: 'Papel triplo macio. Conforto de nobre.',
  },
  {
    id: 'leve-toalha-papel',
    level: 'leve',
    text: 'Uma folha de papel-toalha resolve.',
  },
  {
    id: 'leve-lencinho',
    level: 'leve',
    text: 'Lencinho umedecido, com elegância.',
  },
  {
    id: 'leve-contar-dez',
    level: 'leve',
    text: 'Conte até dez antes de dar a descarga.',
  },
  {
    id: 'leve-perfume',
    level: 'leve',
    text: 'Borrife um perfuminho depois. Educação.',
  },
  {
    id: 'leve-tampa-fechada',
    level: 'leve',
    text: 'Dê a descarga com a tampa fechada. Etiqueta.',
  },
  {
    id: 'leve-papel-bambu',
    level: 'leve',
    text: 'Papel de bambu sustentável. Natureza agradece.',
  },
  {
    id: 'leve-folha-dupla',
    level: 'leve',
    text: 'Folha dupla, conforto consciente.',
  },
  {
    id: 'leve-guardar-fila',
    level: 'leve',
    text: 'Espere a fila com paciência zen.',
  },
  {
    id: 'leve-meditar',
    level: 'leve',
    text: 'Medite por um minuto antes de levantar.',
  },
  {
    id: 'leve-lava-maos',
    level: 'leve',
    text: 'Lave as mãos por trinta segundos. Sem desculpa.',
  },
  {
    id: 'leve-aromatizar',
    level: 'leve',
    text: 'Acenda um fósforo: diplomacia olfativa.',
  },
  {
    id: 'leve-papel-fino',
    level: 'leve',
    text: 'Papel fino, técnica refinada.',
  },
  {
    id: 'leve-dobra-tripla',
    level: 'leve',
    text: 'Dobra tripla de precisão suíça.',
  },
  {
    id: 'leve-canto-baixo',
    level: 'leve',
    text: 'Cantarole baixinho. Trono também é palco.',
  },
  {
    id: 'leve-postura',
    level: 'leve',
    text: 'Postura ereta, dignidade de rei.',
  },
  {
    id: 'leve-toalhinha',
    level: 'leve',
    text: 'Toalhinha de rosto exclusiva do trono.',
  },
  {
    id: 'leve-papel-florido',
    level: 'leve',
    text: 'Papel estampado de florzinha. Charme.',
  },
  {
    id: 'leve-respirar-fundo',
    level: 'leve',
    text: 'Respire fundo três vezes. Calma total.',
  },
  {
    id: 'leve-sem-pressa',
    level: 'leve',
    text: 'Sem pressa nenhuma. O trono é seu.',
  },
  {
    id: 'leve-uma-mao',
    level: 'leve',
    text: 'Resolva com uma mão só nas costas.',
  },
  {
    id: 'leve-agua-caneca',
    level: 'leve',
    text: 'Uma caneca de água, à moda antiga suave.',
  },
  {
    id: 'leve-papel-perfumado',
    level: 'leve',
    text: 'Papel perfumado de lavanda.',
  },
  {
    id: 'leve-folha-eucalipto',
    level: 'leve',
    text: 'Folha de eucalipto: aroma de spa.',
  },
  {
    id: 'leve-contagem-regressiva',
    level: 'leve',
    text: 'Contagem regressiva mental: 3, 2, 1.',
  },
  {
    id: 'leve-modo-furtivo',
    level: 'leve',
    text: 'Modo furtivo: entre e saia sem rastros.',
  },
  {
    id: 'leve-papel-jornalzinho',
    level: 'leve',
    text: 'Tirinha de jornal de domingo, leve.',
  },
  {
    id: 'leve-dobrar-leque',
    level: 'leve',
    text: 'Dobre o papel em leque elegante.',
  },
  {
    id: 'leve-cantar-mpb',
    level: 'leve',
    text: 'Cante um clássico da MPB inteiro.',
  },
  {
    id: 'leve-papel-reuso',
    level: 'leve',
    text: 'Reaproveite o verso da folha de rascunho.',
  },
  {
    id: 'leve-zen',
    level: 'leve',
    text: 'Atinja o estado zen absoluto no trono.',
  },
  {
    id: 'leve-folha-alface',
    level: 'leve',
    text: 'Folha de alface fresquinha. Salada não.',
  },
  {
    id: 'leve-meia-descarga',
    level: 'leve',
    text: 'Use a meia-descarga ecológica.',
  },
  {
    id: 'leve-papel-rosa',
    level: 'leve',
    text: 'Papel rosa perfumado da titia.',
  },
  {
    id: 'leve-respiro-final',
    level: 'leve',
    text: 'Um respiro final de alívio profundo.',
  },
  {
    id: 'leve-toque-suave',
    level: 'leve',
    text: 'Toque suave, sem agredir o recurso.',
  },
  {
    id: 'leve-papel-coracao',
    level: 'leve',
    text: 'Papel com corações. Romântico demais.',
  },
  {
    id: 'leve-folha-hortela',
    level: 'leve',
    text: 'Folha de hortelã: frescor de chiclete.',
  },
  {
    id: 'leve-musica-classica',
    level: 'leve',
    text: 'Ouça (na mente) uma sinfonia inteira.',
  },
  {
    id: 'leve-papel-listrado',
    level: 'leve',
    text: 'Papel listradinho de hotel cinco estrelas.',
  },
  {
    id: 'leve-dobra-diagonal',
    level: 'leve',
    text: 'Dobra na diagonal, geometria refinada.',
  },
  {
    id: 'leve-saudacao',
    level: 'leve',
    text: 'Faça uma reverência ao sair do trono.',
  },
  { id: 'leve-papel-nuvem', level: 'leve', text: 'Papel macio que nem nuvem.' },
  {
    id: 'leve-folha-louro',
    level: 'leve',
    text: 'Folha de louro: tempero e dignidade.',
  },
  {
    id: 'leve-economia-extrema',
    level: 'leve',
    text: 'Use exatamente um quadradinho. A lenda começa aqui.',
  },
  {
    id: 'leve-papel-dourado',
    level: 'leve',
    text: 'Papel dourado de realeza.',
  },
  {
    id: 'leve-sussurro',
    level: 'leve',
    text: 'Sussurre um agradecimento ao vaso.',
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
    id: 'medio-balde',
    level: 'medio',
    text: 'Um balde de água fria. Acorda a alma.',
  },
  {
    id: 'medio-caneca-fria',
    level: 'medio',
    text: 'Caneca de água gelada. Coragem líquida.',
  },
  {
    id: 'medio-garrafa-pet',
    level: 'medio',
    text: 'Garrafa PET furada vira chuveirinho ninja.',
  },
  {
    id: 'medio-regador',
    level: 'medio',
    text: 'Regador de jardim. Chuva tropical caseira.',
  },
  {
    id: 'medio-jornal-velho',
    level: 'medio',
    text: 'Jornal velho amassado. Notícia de ontem, útil hoje.',
  },
  {
    id: 'medio-lista-telefonica',
    level: 'medio',
    text: 'Página da lista telefônica. Quem ainda tem?',
  },
  {
    id: 'medio-revista',
    level: 'medio',
    text: 'Página de revista de fofoca. Celebridade útil.',
  },
  {
    id: 'medio-papelao',
    level: 'medio',
    text: 'Pedaço de papelão. Áspero, mas honesto.',
  },
  {
    id: 'medio-jarra',
    level: 'medio',
    text: 'Despeje uma jarra inteira com pontaria.',
  },
  {
    id: 'medio-esguicho',
    level: 'medio',
    text: 'Esguicho de pia com precisão cirúrgica.',
  },
  {
    id: 'medio-mangueirinha',
    level: 'medio',
    text: 'Mangueirinha do chuveirinho no talo.',
  },
  { id: 'medio-bacia', level: 'medio', text: 'Bacia de água e muita fé.' },
  {
    id: 'medio-meia-velha',
    level: 'medio',
    text: 'Meia velha (lavável depois... talvez).',
  },
  {
    id: 'medio-camiseta-velha',
    level: 'medio',
    text: 'Camiseta velha aposentada com honra.',
  },
  {
    id: 'medio-pano-prato',
    level: 'medio',
    text: 'Pano de prato reconvertido. Sem volta.',
  },
  {
    id: 'medio-toalha-rosto',
    level: 'medio',
    text: 'Toalha de rosto sacrificada pela causa.',
  },
  {
    id: 'medio-filtro-cafe',
    level: 'medio',
    text: 'Filtro de café usado. Aroma incluso.',
  },
  {
    id: 'medio-papel-presente',
    level: 'medio',
    text: 'Papel de presente. Festa no traseiro.',
  },
  {
    id: 'medio-poca',
    level: 'medio',
    text: 'Uma poça de água da chuva. Improviso urbano.',
  },
  {
    id: 'medio-bica',
    level: 'medio',
    text: 'Bica da praça. Banho público de dignidade.',
  },
  {
    id: 'medio-fonte',
    level: 'medio',
    text: 'Fonte do parque. Romântico e arriscado.',
  },
  {
    id: 'medio-chuva',
    level: 'medio',
    text: 'Espere a chuva e aproveite o momento.',
  },
  {
    id: 'medio-cisterna',
    level: 'medio',
    text: 'Água da cisterna. Reserva estratégica.',
  },
  {
    id: 'medio-balde-poco',
    level: 'medio',
    text: 'Balde puxado do poço. Esforço dobrado.',
  },
  {
    id: 'medio-cuia',
    level: 'medio',
    text: 'Cuia de água, à moda ribeirinha.',
  },
  {
    id: 'medio-vasilha',
    level: 'medio',
    text: 'Vasilha de plástico improvisada.',
  },
  {
    id: 'medio-copo-agua',
    level: 'medio',
    text: 'Um copo de água e muita técnica.',
  },
  {
    id: 'medio-borrifador',
    level: 'medio',
    text: 'Borrifador de planta no modo turbo.',
  },
  {
    id: 'medio-papel-manteiga',
    level: 'medio',
    text: 'Papel-manteiga. Escorrega, mas vai.',
  },
  {
    id: 'medio-guardanapo-bar',
    level: 'medio',
    text: 'Guardanapo fino de bar. Quantidade compensa.',
  },
  {
    id: 'medio-folha-caderno',
    level: 'medio',
    text: 'Folha de caderno pautada. Estudo aplicado.',
  },
  {
    id: 'medio-rascunho',
    level: 'medio',
    text: 'Folha de rascunho amassada. Recicle no susto.',
  },
  {
    id: 'medio-mangueira-jardim',
    level: 'medio',
    text: 'Mangueira do jardim no jato médio.',
  },
  {
    id: 'medio-ducha-fria',
    level: 'medio',
    text: 'Ducha gelada de propósito. Modo viking.',
  },
  {
    id: 'medio-pia',
    level: 'medio',
    text: 'Suba na pia. Acrobacia de risco médio.',
  },
  {
    id: 'medio-vaso-vizinho',
    level: 'medio',
    text: 'Use o chuveirinho do banheiro de visitas.',
  },
  {
    id: 'medio-galao',
    level: 'medio',
    text: 'Galão de água de 20 litros. Peso é treino.',
  },
  {
    id: 'medio-cantil',
    level: 'medio',
    text: 'Cantil de escoteiro. Sempre preparado.',
  },
  {
    id: 'medio-papel-embrulho',
    level: 'medio',
    text: 'Papel de embrulho de feira.',
  },
  {
    id: 'medio-jato-pia',
    level: 'medio',
    text: 'Jato direto da pia, equilíbrio de ginasta.',
  },
  {
    id: 'medio-balde-praia',
    level: 'medio',
    text: 'Baldinho de praia. Nostalgia funcional.',
  },
  {
    id: 'medio-revista-luxo',
    level: 'medio',
    text: 'Página de revista de luxo. Glamour áspero.',
  },
  {
    id: 'medio-papel-fax',
    level: 'medio',
    text: 'Papel de fax (achou um? parabéns).',
  },
  {
    id: 'medio-toalha-praia',
    level: 'medio',
    text: 'Toalha de praia. Areia de brinde.',
  },
  {
    id: 'medio-esponja-banho',
    level: 'medio',
    text: 'Esponja de banho reciclada.',
  },
  {
    id: 'medio-bucha',
    level: 'medio',
    text: 'Bucha de banho. Esfoliação radical.',
  },
  {
    id: 'medio-papel-cartao',
    level: 'medio',
    text: 'Papel cartão. Firmeza estrutural.',
  },
  {
    id: 'medio-encarte',
    level: 'medio',
    text: 'Encarte de supermercado. Promoção útil.',
  },
  {
    id: 'medio-plano-b',
    level: 'medio',
    text: 'Plano B duvidoso: não. Use a torneira mesmo.',
  },
  {
    id: 'medio-balde-gelo',
    level: 'medio',
    text: 'Balde com gelo. Choque térmico premium.',
  },
  {
    id: 'medio-bide-viagem',
    level: 'medio',
    text: 'Bidê portátil de viagem. Tecnologia de ponta.',
  },
  {
    id: 'medio-papel-seda',
    level: 'medio',
    text: 'Papel de seda de embrulho. Delicado, arriscado.',
  },
  {
    id: 'medio-jarra-suco',
    level: 'medio',
    text: 'Jarra (vazia, por favor) de suco.',
  },
  {
    id: 'medio-folha-agenda',
    level: 'medio',
    text: 'Folha de agenda velha. 2019 finalmente serve.',
  },
  {
    id: 'medio-garrafa-vinho',
    level: 'medio',
    text: 'Garrafa de vinho vazia como esguicho chique.',
  },
  {
    id: 'medio-pano-chao',
    level: 'medio',
    text: 'Pano de chão novo (juramos que novo).',
  },
  {
    id: 'medio-papel-kraft',
    level: 'medio',
    text: 'Papel kraft pardo. Rústico-chique.',
  },
  {
    id: 'medio-aspersor',
    level: 'medio',
    text: 'Aspersor de jardim. Banho giratório.',
  },
  {
    id: 'medio-cuia-mate',
    level: 'medio',
    text: 'Cuia de chimarrão reaproveitada. Gauchada.',
  },
  {
    id: 'medio-jornal-esporte',
    level: 'medio',
    text: 'Caderno de esportes. Time perdeu, papel ganhou.',
  },
  {
    id: 'medio-balde-mop',
    level: 'medio',
    text: 'Balde de esfregão. Multiuso extremo.',
  },
  {
    id: 'medio-papel-pardo',
    level: 'medio',
    text: 'Papel pardo de mercadinho.',
  },
  {
    id: 'medio-mangueira-carro',
    level: 'medio',
    text: 'Mangueira de lavar carro. Pressão média.',
  },
  {
    id: 'medio-panfleto',
    level: 'medio',
    text: 'Panfleto de pizzaria. Entrega rápida.',
  },
  {
    id: 'medio-copo-descartavel',
    level: 'medio',
    text: 'Copo descartável de água, várias viagens.',
  },
  {
    id: 'medio-toalha-mao',
    level: 'medio',
    text: 'Toalha de mão do lavabo. A visita vai entender.',
  },
  {
    id: 'medio-bide-turbo',
    level: 'medio',
    text: 'Bidê no modo turbo. Segura firme.',
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
  {
    id: 'insano-sabugo-milho',
    level: 'insano',
    text: 'Sabugo de milho. Clássico atemporal da roça.',
  },
  {
    id: 'insano-graveto-pinheiro',
    level: 'insano',
    text: 'Graveto de pinheiro. Resina de brinde.',
  },
  {
    id: 'insano-brita',
    level: 'insano',
    text: 'Esfregue na brita. Sim, na brita.',
  },
  {
    id: 'insano-folha-figueira',
    level: 'insano',
    text: 'Folha de figueira, modo bíblico.',
  },
  {
    id: 'insano-capim',
    level: 'insano',
    text: 'Um punhado de capim do campo.',
  },
  {
    id: 'insano-musgo',
    level: 'insano',
    text: 'Musgo da pedra. Verdinho e macio... será?',
  },
  {
    id: 'insano-casca-arvore',
    level: 'insano',
    text: 'Casca de árvore. Rústico nível Amazônia.',
  },
  {
    id: 'insano-pinha',
    level: 'insano',
    text: 'Pinha seca. Coragem de lenhador.',
  },
  {
    id: 'insano-bucha-vegetal',
    level: 'insano',
    text: 'Bucha vegetal selvagem, sem dó.',
  },
  {
    id: 'insano-palha-milho',
    level: 'insano',
    text: 'Punhado de palha de milho seca.',
  },
  {
    id: 'insano-areia',
    level: 'insano',
    text: 'Areia da praia. Esfoliação de mil grãos.',
  },
  { id: 'insano-terra', level: 'insano', text: 'Terra batida. Volte ao pó.' },
  {
    id: 'insano-pedra-lisa',
    level: 'insano',
    text: 'Pedra lisa do rio, escolhida a dedo.',
  },
  {
    id: 'insano-pedra-pomes',
    level: 'insano',
    text: 'Pedra-pomes. Esfoliação vulcânica.',
  },
  {
    id: 'insano-concha',
    level: 'insano',
    text: 'Concha do mar. Sereia aprova? Duvido.',
  },
  {
    id: 'insano-casca-coco',
    level: 'insano',
    text: 'Casca de coco seco. Tropical e brutal.',
  },
  {
    id: 'insano-fibra-coco',
    level: 'insano',
    text: 'Fibra de coco. Capacho ambulante.',
  },
  {
    id: 'insano-esponja-mar',
    level: 'insano',
    text: 'Esponja-do-mar de verdade. Náutico.',
  },
  {
    id: 'insano-alga',
    level: 'insano',
    text: 'Alga marinha escorregadia. Sushi não.',
  },
  {
    id: 'insano-samambaia',
    level: 'insano',
    text: 'Folha de samambaia da sala. Planta vingada.',
  },
  { id: 'insano-taboa', level: 'insano', text: 'Folha de taboa do brejo.' },
  {
    id: 'insano-junco',
    level: 'insano',
    text: 'Junco trançado na hora. Artesanato de emergência.',
  },
  {
    id: 'insano-cana',
    level: 'insano',
    text: 'Folha de cana-de-açúcar. Doce ilusão.',
  },
  {
    id: 'insano-bambu',
    level: 'insano',
    text: 'Folha de bambu. Panda chocado.',
  },
  {
    id: 'insano-galho',
    level: 'insano',
    text: 'Um galho qualquer. A natureza provê.',
  },
  {
    id: 'insano-raiz',
    level: 'insano',
    text: 'Raiz arrancada do chão. Determinação.',
  },
  {
    id: 'insano-vagem',
    level: 'insano',
    text: 'Casca de vagem. Improviso de horta.',
  },
  {
    id: 'insano-palmeira',
    level: 'insano',
    text: 'Folha de palmeira. Resort radical.',
  },
  {
    id: 'insano-cipo',
    level: 'insano',
    text: 'Cipó da mata. Tarzan da privada.',
  },
  {
    id: 'insano-liquen',
    level: 'insano',
    text: 'Líquen de tronco. Fungo corajoso.',
  },
  {
    id: 'insano-lodo',
    level: 'insano',
    text: 'Lodo da pedra (por que você faria isso?).',
  },
  {
    id: 'insano-galho-eucalipto',
    level: 'insano',
    text: 'Galho de eucalipto inteiro. Koala foge.',
  },
  {
    id: 'insano-folha-manga',
    level: 'insano',
    text: 'Folha do pé de manga. Sombra e ousadia.',
  },
  {
    id: 'insano-lixa',
    level: 'insano',
    text: 'Lixa de parede. Grão 80, sem anestesia.',
  },
  {
    id: 'insano-palha-aco',
    level: 'insano',
    text: 'Palha de aço. Brilho de inox no fim.',
  },
  {
    id: 'insano-bombril',
    level: 'insano',
    text: 'Bombril. Mil e uma utilidades, agora mil e duas.',
  },
  {
    id: 'insano-escova-dente',
    level: 'insano',
    text: 'Escova de dente velha. Precisão duvidosa.',
  },
  {
    id: 'insano-vassoura',
    level: 'insano',
    text: 'Cerdas da vassoura. Faxina total.',
  },
  {
    id: 'insano-rodo',
    level: 'insano',
    text: 'Borracha do rodo. Limpeza profissional.',
  },
  {
    id: 'insano-estopa',
    level: 'insano',
    text: 'Estopa de oficina. Graxa inclusa, talvez.',
  },
  {
    id: 'insano-serragem',
    level: 'insano',
    text: 'Punhado de serragem. Marcenaria sanitária.',
  },
  {
    id: 'insano-mar',
    level: 'insano',
    text: 'Mergulhe no mar. Sal cura tudo (e arde).',
  },
  {
    id: 'insano-cachoeira',
    level: 'insano',
    text: 'Debaixo da cachoeira, modo monge.',
  },
  {
    id: 'insano-lago',
    level: 'insano',
    text: 'No lago, junto com os patos confusos.',
  },
  {
    id: 'insano-acude',
    level: 'insano',
    text: 'No açude da fazenda. Boi assistindo.',
  },
  {
    id: 'insano-poco',
    level: 'insano',
    text: 'Desça ao poço. Jornada ao centro da coragem.',
  },
  {
    id: 'insano-neve',
    level: 'insano',
    text: 'Esfregue na neve (se achar uma). Refrescante demais.',
  },
  {
    id: 'insano-cacto',
    level: 'insano',
    text: 'Encare um cacto. Só os bravos (e tolos).',
  },
  {
    id: 'insano-formigueiro',
    level: 'insano',
    text: 'Perto do formigueiro. Pressa garantida.',
  },
  {
    id: 'insano-urtiga',
    level: 'insano',
    text: 'Folha de urtiga. Arrependimento imediato.',
  },
  {
    id: 'insano-sabugo-duplo',
    level: 'insano',
    text: 'Dois sabugos de milho, modo ambidestro.',
  },
  {
    id: 'insano-tijolo',
    level: 'insano',
    text: 'Esfregue no tijolo. Construção civil interna.',
  },
  {
    id: 'insano-cascalho',
    level: 'insano',
    text: 'Punhado de cascalho. Primo da brita.',
  },
  {
    id: 'insano-galho-pinheiro',
    level: 'insano',
    text: 'Galho de pinheiro com agulhas. Ai.',
  },
  {
    id: 'insano-pedregulho',
    level: 'insano',
    text: 'Role num pedregulho. Geologia aplicada.',
  },
  {
    id: 'insano-tronco',
    level: 'insano',
    text: 'Esfregue no tronco caído. Lenhador zen.',
  },
  {
    id: 'insano-cinza',
    level: 'insano',
    text: 'Cinza da fogueira (fria!). Ritual ancestral.',
  },
  {
    id: 'insano-barro',
    level: 'insano',
    text: 'Barro do quintal. Argila premium.',
  },
  {
    id: 'insano-folha-coqueiro',
    level: 'insano',
    text: 'Folha de coqueiro. Praia radical.',
  },
  {
    id: 'insano-espinho',
    level: 'insano',
    text: 'Galho com espinhos. Por que, guerreiro?',
  },
  {
    id: 'insano-pena',
    level: 'insano',
    text: 'Pena de galinha. A ave não autorizou.',
  },
  {
    id: 'insano-couro',
    level: 'insano',
    text: 'Pedaço de couro cru. Faroeste sanitário.',
  },
  {
    id: 'insano-sisal',
    level: 'insano',
    text: 'Corda de sisal. Áspero nível náutico.',
  },
  {
    id: 'insano-juta',
    level: 'insano',
    text: 'Saco de juta. Embalagem reaproveitada.',
  },
  {
    id: 'insano-casca-laranja',
    level: 'insano',
    text: 'Casca de laranja. Cítrico que arde.',
  },
  {
    id: 'insano-folha-seca',
    level: 'insano',
    text: 'Folhas secas do chão. Outono no traseiro.',
  },
  {
    id: 'insano-mato',
    level: 'insano',
    text: 'Punhado de mato qualquer. Sobrevivência pura.',
  },
  {
    id: 'insano-pedra-rio',
    level: 'insano',
    text: 'Pedra do leito do rio, fria e lisa.',
  },
  {
    id: 'insano-lasca-bambu',
    level: 'insano',
    text: 'Lasca de bambu. Samurai da privada.',
  },
  {
    id: 'insano-casca-banana',
    level: 'insano',
    text: 'Casca de banana (escorrega!). Comédia trágica.',
  },
  {
    id: 'insano-taioba',
    level: 'insano',
    text: 'Folha de taioba gigante. Horta heroica.',
  },
];
