import { Nivel } from '../domain/scoring';

export interface Missao {
  id: string;
  level: Nivel;
  text: string;
}

export const MISSOES: ReadonlyArray<Missao> = [
  {
    id: '1',
    level: 'leve',
    text: 'Se limpe com papel higiênico triplo, macio feito nuvem.',
  },
  {
    id: '2',
    level: 'leve',
    text: 'Se limpe com um origami de papel que você dobrou no susto.',
  },
  {
    id: '3',
    level: 'leve',
    text: 'Se limpe com lenço umedecido de bebê, cheirosinho.',
  },
  {
    id: '4',
    level: 'leve',
    text: 'Se limpe com guardanapo de festa de aniversário que sobrou.',
  },
  {
    id: '5',
    level: 'leve',
    text: 'Se limpe com folha de papel reciclado, consciência leve.',
  },
  {
    id: '6',
    level: 'leve',
    text: 'Se limpe com lencinho de pano da vovó, edição vintage.',
  },
  {
    id: '7',
    level: 'leve',
    text: 'Se limpe com papel higiênico estampado de florzinha.',
  },
  {
    id: '8',
    level: 'leve',
    text: 'Se limpe com papel perfumado de lavanda importada.',
  },
  {
    id: '9',
    level: 'leve',
    text: 'Se limpe com papel toalha de cozinha, dois quadrados contados.',
  },
  {
    id: '10',
    level: 'leve',
    text: 'Se limpe com guardanapo de pano de restaurante chique.',
  },
  {
    id: '11',
    level: 'leve',
    text: 'Se limpe com papel higiênico de bambu sustentável.',
  },
  {
    id: '12',
    level: 'leve',
    text: 'Se limpe com um lenço de seda e finja que é nobre.',
  },
  {
    id: '13',
    level: 'leve',
    text: 'Se limpe com algodão de farmácia, fofinho e estéril.',
  },
  {
    id: '14',
    level: 'leve',
    text: 'Se limpe com papel higiênico dourado de realeza.',
  },
  {
    id: '15',
    level: 'leve',
    text: 'Se limpe com folha dupla de conforto consciente.',
  },
  {
    id: '16',
    level: 'leve',
    text: 'Se limpe com papel umedecido em água de rosas.',
  },
  {
    id: '17',
    level: 'leve',
    text: 'Se limpe com papel higiênico cor-de-rosa da titia.',
  },
  {
    id: '18',
    level: 'leve',
    text: 'Se limpe com a toalhinha de rosto exclusiva do trono.',
  },
  {
    id: '19',
    level: 'leve',
    text: 'Se limpe com papel de seda de embrulho de presente.',
  },
  {
    id: '20',
    level: 'leve',
    text: 'Se limpe com guardanapo de bar dobrado em quatro.',
  },
  {
    id: '21',
    level: 'leve',
    text: 'Se limpe com papel macio aquecido no micro-ondas.',
  },
  {
    id: '22',
    level: 'leve',
    text: 'Se limpe com lenço umedecido com extrato de pepino.',
  },
  {
    id: '23',
    level: 'leve',
    text: 'Se limpe com papel higiênico folha simples, modo economia.',
  },
  {
    id: '24',
    level: 'leve',
    text: 'Se limpe com uma pétala de rosa de cada vez, devagar.',
  },
  {
    id: '25',
    level: 'leve',
    text: 'Se limpe com papel embebido em chá de camomila morno.',
  },
  {
    id: '26',
    level: 'leve',
    text: 'Se limpe com paninho de microfibra de limpar óculos.',
  },
  {
    id: '27',
    level: 'leve',
    text: 'Se limpe com papel acetinado de hotel cinco estrelas.',
  },
  {
    id: '28',
    level: 'leve',
    text: 'Se limpe com papel com aloe vera, refrescante.',
  },
  {
    id: '29',
    level: 'leve',
    text: 'Se limpe com lenço mentolado, frescor suave.',
  },
  {
    id: '30',
    level: 'leve',
    text: 'Se limpe com fralda de pano nova, ainda na embalagem.',
  },
  {
    id: '31',
    level: 'leve',
    text: 'Se limpe com papel higiênico de luxo importado do Japão.',
  },
  {
    id: '32',
    level: 'leve',
    text: 'Se limpe com papel com aroma de baunilha.',
  },
  {
    id: '33',
    level: 'leve',
    text: 'Se limpe com plumas de travesseiro, modo realeza.',
  },
  {
    id: '34',
    level: 'leve',
    text: 'Se limpe com paninho de veludo e devolva na gaveta.',
  },
  {
    id: '35',
    level: 'leve',
    text: 'Se limpe com papel umedecido de eucalipto.',
  },
  {
    id: '36',
    level: 'leve',
    text: 'Se limpe com papel de presente macio que sobrou do Natal.',
  },
  {
    id: '37',
    level: 'leve',
    text: 'Se limpe com guardanapo de buffet de casamento.',
  },
  {
    id: '38',
    level: 'leve',
    text: 'Se limpe com papel com gotinhas de lavanda.',
  },
  {
    id: '39',
    level: 'leve',
    text: 'Se limpe com papel acolchoado, tipo papel-bolha do bem.',
  },
  {
    id: '40',
    level: 'leve',
    text: 'Se limpe com lenço de linho passado a ferro.',
  },
  {
    id: '41',
    level: 'leve',
    text: 'Se limpe com papel ultra-soft de comercial de TV.',
  },
  {
    id: '42',
    level: 'leve',
    text: 'Se limpe com algodão hidrófilo em bola, modo nuvem.',
  },
  {
    id: '43',
    level: 'leve',
    text: 'Se limpe com papel com glicerina, escorregadinho.',
  },
  {
    id: '44',
    level: 'leve',
    text: 'Se limpe com folha de alface lavada e gelada, fresquíssimo.',
  },
  {
    id: '45',
    level: 'leve',
    text: 'Se limpe com papel embebido em água termal de spa.',
  },
  {
    id: '46',
    level: 'leve',
    text: 'Se limpe com papel com chá verde antioxidante.',
  },
  {
    id: '47',
    level: 'leve',
    text: 'Se limpe com lenço japonês perfumado de gueixa.',
  },
  {
    id: '48',
    level: 'leve',
    text: 'Se limpe com papel toalha úmido de banheiro de shopping.',
  },
  {
    id: '49',
    level: 'leve',
    text: 'Se limpe com papel triplo aromatizado de morango.',
  },
  {
    id: '50',
    level: 'leve',
    text: 'Se limpe com paninho de cashmere herdado da família.',
  },
  {
    id: '51',
    level: 'leve',
    text: 'Se limpe com papel com óleo de amêndoas.',
  },
  {
    id: '52',
    level: 'leve',
    text: 'Se limpe com lenço de algodão egípcio fio 600.',
  },
  {
    id: '53',
    level: 'leve',
    text: 'Se limpe com papel macio de banheiro de spa.',
  },
  {
    id: '54',
    level: 'leve',
    text: 'Se limpe com papel umedecido morninho de inverno.',
  },
  {
    id: '55',
    level: 'leve',
    text: 'Se limpe com papel com extrato de camomila relaxante.',
  },
  {
    id: '56',
    level: 'leve',
    text: 'Se limpe com guardanapo de papel de festa junina.',
  },
  {
    id: '57',
    level: 'leve',
    text: 'Se limpe com papel higiênico perfumado de talco.',
  },
  {
    id: '58',
    level: 'leve',
    text: 'Se limpe com um lencinho descartável de bolso de terno.',
  },
  {
    id: '59',
    level: 'leve',
    text: 'Se limpe com papel reciclado de caixa de leite lavada.',
  },
  {
    id: '60',
    level: 'leve',
    text: 'Se limpe com papel de hotel cinco estrelas com a pontinha dobrada.',
  },
  {
    id: '61',
    level: 'leve',
    text: 'Se limpe com papel com hidratante embutido, modo creme.',
  },
  {
    id: '62',
    level: 'leve',
    text: 'Se limpe com folha de hortelã fresca, hálito no lugar errado.',
  },
  {
    id: '63',
    level: 'leve',
    text: 'Se limpe com papel toalha de papelaria novinho.',
  },
  {
    id: '64',
    level: 'leve',
    text: 'Se limpe com lenço umedecido antibacteriano de pediatra.',
  },
  {
    id: '65',
    level: 'leve',
    text: 'Se limpe com papel macio de marca famosa, sem dó.',
  },
  {
    id: '66',
    level: 'leve',
    text: 'Se limpe com papel com aroma de algodão-doce.',
  },
  {
    id: '67',
    level: 'leve',
    text: 'Se limpe com papel higiênico de quatro camadas, exagero gostoso.',
  },
  {
    id: '68',
    level: 'leve',
    text: 'Se limpe com papel macio e ainda passe perfume no final.',
  },
  {
    id: '69',
    level: 'medio',
    text: 'Se limpe com jornal de ontem amassado várias vezes.',
  },
  {
    id: '70',
    level: 'medio',
    text: 'Se limpe com a ducha higiênica no jato fraco, guerreiro.',
  },
  {
    id: '71',
    level: 'medio',
    text: 'Se limpe com um balde de água fria que acorda a alma.',
  },
  {
    id: '72',
    level: 'medio',
    text: 'Se limpe com página de revista de fofoca, celebridade útil.',
  },
  {
    id: '73',
    level: 'medio',
    text: 'Se limpe com a mão e lave ela na pia depois.',
  },
  {
    id: '74',
    level: 'medio',
    text: 'Se limpe com garrafa PET furada virada chuveirinho ninja.',
  },
  {
    id: '75',
    level: 'medio',
    text: 'Se limpe com papelão de caixa desmontada, áspero mas honesto.',
  },
  {
    id: '76',
    level: 'medio',
    text: 'Se limpe com um copo de água e muita técnica de pontaria.',
  },
  {
    id: '77',
    level: 'medio',
    text: 'Se limpe com folha de caderno pautada arrancada na pressa.',
  },
  {
    id: '78',
    level: 'medio',
    text: 'Se limpe com meia velha lavável depois... talvez.',
  },
  {
    id: '79',
    level: 'medio',
    text: 'Se limpe com pano de prato reconvertido sem volta.',
  },
  {
    id: '80',
    level: 'medio',
    text: 'Se limpe com filtro de café usado, aroma incluso.',
  },
  {
    id: '81',
    level: 'medio',
    text: 'Se limpe com regador de jardim, chuva tropical caseira.',
  },
  {
    id: '82',
    level: 'medio',
    text: 'Se limpe com camiseta velha aposentada com honra.',
  },
  {
    id: '83',
    level: 'medio',
    text: 'Se limpe com página da lista telefônica, quem ainda tem?',
  },
  {
    id: '84',
    level: 'medio',
    text: 'Se limpe com a mangueirinha do chuveirinho no talo.',
  },
  {
    id: '85',
    level: 'medio',
    text: 'Se limpe com encarte de supermercado, promoção útil.',
  },
  {
    id: '86',
    level: 'medio',
    text: 'Se limpe com toalha de rosto sacrificada pela causa.',
  },
  {
    id: '87',
    level: 'medio',
    text: 'Se limpe com jato direto da torneira, equilíbrio de ginasta.',
  },
  {
    id: '88',
    level: 'medio',
    text: 'Se limpe com papel de fax (se achar um, parabéns).',
  },
  {
    id: '89',
    level: 'medio',
    text: 'Se limpe com bucha de banho, esfoliação radical.',
  },
  {
    id: '90',
    level: 'medio',
    text: 'Se limpe com borrifador de planta no modo turbo.',
  },
  {
    id: '91',
    level: 'medio',
    text: 'Se limpe com cuia de água à moda ribeirinha.',
  },
  {
    id: '92',
    level: 'medio',
    text: 'Se limpe com panfleto de pizzaria entregue na hora.',
  },
  {
    id: '93',
    level: 'medio',
    text: 'Se limpe com papel manteiga que escorrega mas vai.',
  },
  {
    id: '94',
    level: 'medio',
    text: 'Se limpe com a água da poça da chuva, improviso urbano.',
  },
  {
    id: '95',
    level: 'medio',
    text: 'Se limpe com galão de 20 litros, peso é treino.',
  },
  {
    id: '96',
    level: 'medio',
    text: 'Se limpe com cantil de escoteiro, sempre preparado.',
  },
  {
    id: '97',
    level: 'medio',
    text: 'Se limpe com folha de agenda velha, 2019 finalmente serve.',
  },
  {
    id: '98',
    level: 'medio',
    text: 'Se limpe com pano de chão novo (juramos que novo).',
  },
  {
    id: '99',
    level: 'medio',
    text: 'Se limpe com a mangueira de lavar carro na pressão média.',
  },
  {
    id: '100',
    level: 'medio',
    text: 'Se limpe com copo descartável, várias viagens à pia.',
  },
  {
    id: '101',
    level: 'medio',
    text: 'Se limpe com papel kraft pardo, rústico-chique.',
  },
  {
    id: '102',
    level: 'medio',
    text: 'Se limpe com revista de consultório médico, conteúdo de espera.',
  },
  {
    id: '103',
    level: 'medio',
    text: 'Se limpe com saco de pão reforçado da padaria.',
  },
  {
    id: '104',
    level: 'medio',
    text: 'Se limpe com a água da jarra (vazia de suco, por favor).',
  },
  {
    id: '105',
    level: 'medio',
    text: 'Se limpe com folha de prova antiga, ainda com o trauma.',
  },
  {
    id: '106',
    level: 'medio',
    text: 'Se limpe com esponja de banho reciclada.',
  },
  {
    id: '107',
    level: 'medio',
    text: 'Se limpe com balde de água do poço puxado na corda.',
  },
  {
    id: '108',
    level: 'medio',
    text: 'Se limpe com papelão fino de caixa de cereal.',
  },
  {
    id: '109',
    level: 'medio',
    text: 'Se limpe com a água do aspersor de jardim giratório.',
  },
  {
    id: '110',
    level: 'medio',
    text: 'Se limpe com envelope de conta antiga já aberto.',
  },
  {
    id: '111',
    level: 'medio',
    text: 'Se limpe com cuia de chimarrão reaproveitada, gauchada.',
  },
  {
    id: '112',
    level: 'medio',
    text: 'Se limpe com caderno de esportes do time que perdeu.',
  },
  {
    id: '113',
    level: 'medio',
    text: 'Se limpe com balde de esfregão multiuso extremo.',
  },
  {
    id: '114',
    level: 'medio',
    text: 'Se limpe com folha de manual de eletrodoméstico.',
  },
  {
    id: '115',
    level: 'medio',
    text: 'Se limpe com a água da bica da praça, banho público.',
  },
  {
    id: '116',
    level: 'medio',
    text: 'Se limpe com toalha de praia com areia de brinde.',
  },
  {
    id: '117',
    level: 'medio',
    text: 'Se limpe com bidê portátil de viagem, tecnologia de ponta.',
  },
  {
    id: '118',
    level: 'medio',
    text: 'Se limpe com cartaz rasgado de show antigo.',
  },
  {
    id: '119',
    level: 'medio',
    text: 'Se limpe com a água da fonte do parque, romântico e arriscado.',
  },
  {
    id: '120',
    level: 'medio',
    text: 'Se limpe com mapa impresso da cidade desatualizado.',
  },
  {
    id: '121',
    level: 'medio',
    text: 'Se limpe com bacia de água gelada e muita fé.',
  },
  {
    id: '122',
    level: 'medio',
    text: 'Se limpe com papel de embalagem de arroz vazio.',
  },
  {
    id: '123',
    level: 'medio',
    text: 'Se limpe com a água da cisterna, reserva estratégica.',
  },
  {
    id: '124',
    level: 'medio',
    text: 'Se limpe com caixa de pizza desmontada, já seca.',
  },
  {
    id: '125',
    level: 'medio',
    text: 'Se limpe com vasilha de plástico improvisada.',
  },
  {
    id: '126',
    level: 'medio',
    text: 'Se limpe com folha de apostila suja de marca-texto.',
  },
  {
    id: '127',
    level: 'medio',
    text: 'Se limpe com a água do balde de gelo, choque térmico premium.',
  },
  {
    id: '128',
    level: 'medio',
    text: 'Se limpe com cartão de visita antigo, networking sujo.',
  },
  {
    id: '129',
    level: 'medio',
    text: 'Se limpe com guardanapo finíssimo de bar, quantidade compensa.',
  },
  {
    id: '130',
    level: 'medio',
    text: 'Se limpe com a água da garrafa de vinho vazia, esguicho chique.',
  },
  {
    id: '131',
    level: 'medio',
    text: 'Se limpe com folha impressa frente e verso da prova escolar.',
  },
  {
    id: '132',
    level: 'medio',
    text: 'Se limpe com baldinho de praia, nostalgia funcional.',
  },
  {
    id: '133',
    level: 'medio',
    text: 'Se limpe com papel de propaganda de loja que já fechou.',
  },
  {
    id: '134',
    level: 'medio',
    text: 'Se limpe com a esponja de maquiagem antiga (coragem).',
  },
  {
    id: '135',
    level: 'medio',
    text: 'Se limpe com jornal de economia antigo, mercado em baixa.',
  },
  {
    id: '136',
    level: 'medio',
    text: 'Se limpe com a água da mangueira do quintal no talo.',
  },
  {
    id: '137',
    level: 'medio',
    text: 'Se limpe com revista de tecnologia ultrapassada de 2008.',
  },
  {
    id: '138',
    level: 'medio',
    text: 'Se limpe com a mão e jure que lava com sabão depois.',
  },
  {
    id: '139',
    level: 'insano',
    text: 'Se limpe com sabugo de milho velho, clássico atemporal da roça.',
  },
  {
    id: '140',
    level: 'insano',
    text: 'Se limpe com a água do rio Tietê, sal e bônus radioativo.',
  },
  {
    id: '141',
    level: 'insano',
    text: 'Se limpe com folha de bananeira, volte às origens.',
  },
  {
    id: '142',
    level: 'insano',
    text: 'Se limpe com lixa de parede grão 80, sem anestesia.',
  },
  {
    id: '143',
    level: 'insano',
    text: 'Se limpe com brita do quintal, sim, na brita.',
  },
  {
    id: '144',
    level: 'insano',
    text: 'Se limpe com palha de aço Bombril, mil e uma utilidades.',
  },
  {
    id: '145',
    level: 'insano',
    text: 'Se limpe com folha de urtiga, arrependimento imediato.',
  },
  {
    id: '146',
    level: 'insano',
    text: 'Se limpe com casca de coco seco, tropical e brutal.',
  },
  {
    id: '147',
    level: 'insano',
    text: 'Se limpe com pedra-pomes, esfoliação vulcânica.',
  },
  {
    id: '148',
    level: 'insano',
    text: 'Se limpe com graveto de pinheiro com resina de brinde.',
  },
  {
    id: '149',
    level: 'insano',
    text: 'Se limpe com um cacto inteiro, só os bravos e tolos.',
  },
  {
    id: '150',
    level: 'insano',
    text: 'Se limpe com areia da praia, esfoliação de mil grãos.',
  },
  {
    id: '151',
    level: 'insano',
    text: 'Se limpe com folha de figueira, modo bíblico.',
  },
  {
    id: '152',
    level: 'insano',
    text: 'Se limpe com casca de árvore, rústico nível Amazônia.',
  },
  {
    id: '153',
    level: 'insano',
    text: 'Se limpe com bucha vegetal selvagem, sem dó.',
  },
  {
    id: '154',
    level: 'insano',
    text: 'Se limpe com cerdas de vassoura, faxina total.',
  },
  {
    id: '155',
    level: 'insano',
    text: 'Se limpe com a água do mangue, lama e caranguejo confuso.',
  },
  {
    id: '156',
    level: 'insano',
    text: 'Se limpe com pinha seca, coragem de lenhador.',
  },
  {
    id: '157',
    level: 'insano',
    text: 'Se limpe com musgo da pedra, verdinho e duvidoso.',
  },
  {
    id: '158',
    level: 'insano',
    text: 'Se limpe com terra batida e volte ao pó.',
  },
  {
    id: '159',
    level: 'insano',
    text: 'Se limpe com a borracha do rodo, limpeza profissional.',
  },
  {
    id: '160',
    level: 'insano',
    text: 'Se limpe com folha de samambaia da sala, planta vingada.',
  },
  {
    id: '161',
    level: 'insano',
    text: 'Se limpe com lasca de bambu, samurai da privada.',
  },
  {
    id: '162',
    level: 'insano',
    text: 'Se limpe com estopa de oficina, graxa inclusa.',
  },
  {
    id: '163',
    level: 'insano',
    text: 'Se limpe com pedaço de tijolo, construção civil interna.',
  },
  {
    id: '164',
    level: 'insano',
    text: 'Se limpe com casca de laranja, cítrico que arde.',
  },
  {
    id: '165',
    level: 'insano',
    text: 'Se limpe com escova de dente velha, precisão duvidosa.',
  },
  {
    id: '166',
    level: 'insano',
    text: 'Se limpe com a água da privada do posto de gasolina.',
  },
  {
    id: '167',
    level: 'insano',
    text: 'Se limpe com punhado de serragem, marcenaria sanitária.',
  },
  {
    id: '168',
    level: 'insano',
    text: 'Se limpe com cipó da mata, Tarzan da privada.',
  },
  {
    id: '169',
    level: 'insano',
    text: 'Se limpe com pena de galinha, a ave não autorizou.',
  },
  {
    id: '170',
    level: 'insano',
    text: 'Se limpe com galho com espinhos, por que, guerreiro?',
  },
  {
    id: '171',
    level: 'insano',
    text: 'Se limpe com cinza fria da fogueira, ritual ancestral.',
  },
  {
    id: '172',
    level: 'insano',
    text: 'Se limpe com a água do açude com o boi assistindo.',
  },
  {
    id: '173',
    level: 'insano',
    text: 'Se limpe com corda de sisal, áspero nível náutico.',
  },
  {
    id: '174',
    level: 'insano',
    text: 'Se limpe com saco de juta arranhento.',
  },
  {
    id: '175',
    level: 'insano',
    text: 'Se limpe com pedregulho rolado na mão, geologia aplicada.',
  },
  {
    id: '176',
    level: 'insano',
    text: 'Se limpe com fibra de coco, capacho ambulante.',
  },
  {
    id: '177',
    level: 'insano',
    text: 'Se limpe com folha de cana-de-açúcar, doce ilusão.',
  },
  {
    id: '178',
    level: 'insano',
    text: 'Se limpe com concha do mar, sereia reprova.',
  },
  {
    id: '179',
    level: 'insano',
    text: 'Se limpe com alga marinha escorregadia, sushi não.',
  },
  {
    id: '180',
    level: 'insano',
    text: 'Se limpe com barro do quintal, argila premium.',
  },
  {
    id: '181',
    level: 'insano',
    text: 'Se limpe com a água do lago junto com os patos confusos.',
  },
  {
    id: '182',
    level: 'insano',
    text: 'Se limpe com lixa de unha já usada e enferrujada.',
  },
  {
    id: '183',
    level: 'insano',
    text: 'Se limpe com galho de eucalipto inteiro, koala foge.',
  },
  {
    id: '184',
    level: 'insano',
    text: 'Se limpe com cascalho da estrada, primo da brita.',
  },
  {
    id: '185',
    level: 'insano',
    text: 'Se limpe com pelo do tapete velho da sala.',
  },
  {
    id: '186',
    level: 'insano',
    text: 'Se limpe com a neve do freezer raspada na unha.',
  },
  {
    id: '187',
    level: 'insano',
    text: 'Se limpe com líquen de tronco, fungo corajoso.',
  },
  {
    id: '188',
    level: 'insano',
    text: 'Se limpe com couro cru, faroeste sanitário.',
  },
  {
    id: '189',
    level: 'insano',
    text: 'Se limpe com folha de taioba gigante, horta heroica.',
  },
  {
    id: '190',
    level: 'insano',
    text: 'Se limpe com a água da cachoeira gelada, modo monge.',
  },
  {
    id: '191',
    level: 'insano',
    text: 'Se limpe com palha de milho seca, do pé direto pra mão.',
  },
  {
    id: '192',
    level: 'insano',
    text: 'Se limpe com pedaço de papelão molhado do lixo.',
  },
  {
    id: '193',
    level: 'insano',
    text: 'Se limpe com galho de pinheiro com agulhas, ai.',
  },
  {
    id: '194',
    level: 'insano',
    text: 'Se limpe com casca de banana e escorregue de bônus.',
  },
  {
    id: '195',
    level: 'insano',
    text: 'Se limpe com esponja-do-mar de verdade, náutico.',
  },
  {
    id: '196',
    level: 'insano',
    text: 'Se limpe com a água do poço escuro, jornada ao centro da coragem.',
  },
  {
    id: '197',
    level: 'insano',
    text: 'Se limpe com raiz arrancada do chão com determinação.',
  },
  {
    id: '198',
    level: 'insano',
    text: 'Se limpe com folhas secas do chão, outono no traseiro.',
  },
  {
    id: '199',
    level: 'insano',
    text: 'Se limpe com pedaço de lodo da pedra (por quê?).',
  },
  {
    id: '200',
    level: 'insano',
    text: 'Se limpe com junco trançado na hora, artesanato de emergência.',
  },
  {
    id: '201',
    level: 'insano',
    text: 'Se limpe com dois sabugos de milho ao mesmo tempo, modo ambidestro.',
  },
  {
    id: '202',
    level: 'insano',
    text: 'Se limpe com a água salgada do mar e arda com classe.',
  },
  {
    id: '203',
    level: 'insano',
    text: 'Se limpe com folha de palmeira, resort radical.',
  },
  {
    id: '204',
    level: 'insano',
    text: 'Se limpe com tronco caído na mata, lenhador zen.',
  },
  {
    id: '205',
    level: 'insano',
    text: 'Se limpe com a água da chuva ácida da cidade grande.',
  },
  {
    id: '206',
    level: 'insano',
    text: 'Se limpe com pelo de cachorro vira-lata (peça licença antes).',
  },
  {
    id: '207',
    level: 'insano',
    text: 'Se limpe com casca de abacaxi, espinho tropical.',
  },
  {
    id: '208',
    level: 'insano',
    text: 'Se limpe com folha de coqueiro, praia radical.',
  },
  {
    id: '209',
    level: 'insano',
    text: 'Se limpe com a água da valeta a céu aberto, modo apocalipse.',
  },
  {
    id: '210',
    level: 'insano',
    text: 'Se limpe com vagem de feijão seca, improviso de horta.',
  },
  {
    id: '211',
    level: 'insano',
    text: 'Se limpe com punhado de mato qualquer, sobrevivência pura.',
  },
  {
    id: '212',
    level: 'insano',
    text: 'Se limpe com a própria mão e NÃO lave depois, lenda do caos.',
  },
];
