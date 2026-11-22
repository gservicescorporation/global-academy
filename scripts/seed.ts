import 'dotenv/config';
import { getDb } from '../src/lib/db';
import { hashPassword } from '../src/lib/password';

process.env.DB_SYNC = 'true'; // o seed cria as tabelas se ainda não existirem

const RESET = process.argv.includes('--reset');

async function main() {
  const ds = await getDb();

  if (RESET) {
    // Apaga só o conteúdo editorial (mantém administradores, mensagens e inscrições)
    for (const e of ['CourseSession', 'Course', 'Trainer', 'Highlight', 'WhyItem', 'Partner', 'PaymentMethod', 'Setting']) {
      await ds.getRepository(e).createQueryBuilder().delete().execute();
    }
    console.log('✔ Conteúdo anterior removido');
  }
  const empty = async (e: string) => (await ds.getRepository(e).count()) === 0;

  /* ---------- Administrador ---------- */
  const email = (process.env.ADMIN_EMAIL ?? 'admin@globalacademy.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const users = ds.getRepository('User');
  if (!(await users.findOne({ where: { email } }))) {
    await users.save({ email, name: 'Administrador', passwordHash: await hashPassword(password) });
    console.log(`✔ Administrador criado: ${email}`);
  }

  /* ---------- Formadores (fotografias: enviar pelo painel) ---------- */
  const T: Record<string, string> = {};
  if (await empty('Trainer')) {
    const list = [
      { key: 'esmael', name: 'Esmael Canjamba', role: 'Mediador de seguros', bio: 'Com mais de 8 anos de experiência no setor segurador, Esmael Canjamba é mediador de seguros autorizado pela ASF (Autoridade de Supervisão de Seguros e Fundos de Pensões).' },
      { key: 'aguinaldo', name: 'Aguinaldo Jaime', role: 'Economista e antigo Ministro das Finanças', bio: 'Figura política e economista angolana. Foi Ministro das Finanças de Junho de 1990 a abril de 1992, Presidente do Banco Africano de Investimento (com início em 1996) e Governador do Banco Central de 1999 a 2002. Posteriormente, foi Vice-Primeiro Ministro. É também ex-aluno da London School of Economics.' },
      { key: 'relvas', name: 'Miguel Relvas', role: 'Político e antigo governante', bio: 'Político português e antigo governante do Partido Social Democrata. Foi deputado durante mais de 20 anos e desempenhou funções de Secretário de Estado da Administração Local durante o XV Governo. É licenciado em Ciência Política e Relações Internacionais pela Universidade Lusófona.' },
      { key: 'coelho', name: 'Pedro Coelho', role: 'Formador', bio: null },
      { key: 'siza', name: 'Pedro Siza', role: 'Formador', bio: null },
      { key: 'ayuk', name: 'NJ Ayuk', role: 'Formador', bio: null },
      { key: 'chastre', name: 'Anabela Chastre', role: 'Formadora', bio: null },
      { key: 'prata', name: 'Agostinho Prata', role: 'Formador', bio: null },
    ];
    for (const [i, t] of list.entries()) {
      const saved = (await ds.getRepository('Trainer').save({ name: t.name, role: t.role, bio: t.bio, position: i + 1 })) as unknown as { id: string };
      T[t.key] = saved.id;
    }
    console.log('✔ Formadores criados');
  }

  /* ---------- Cursos (sem links de imagens: carregar capas pelo painel) ---------- */
  if (await empty('Course')) {
    await ds.getRepository('Course').save([
      {
        slug: 'gestao-de-sinistro-acidentes-de-trabalho', title: 'Gestão de Sinistro (Acidentes de Trabalho)', area: 'Seguros',
        status: 'soon', featured: true, position: 1, price: 0, currency: 'AOA',
        shortDescription: 'Conceitos, legislação e tramitação do processo de sinistro em acidentes de trabalho.',
        description: 'Este curso tem como objetivo fornecer aos participantes os conhecimentos essenciais para iniciar, gerenciar e agilizar os processos de acionamento de sinistros no âmbito dos seguros de Acidentes de Trabalho.\nReconhecer a importância da Gestão de Sinistros na resolução de divergências entre segurados e Companhias de Seguros envolvidas, identificando suas principais características e objetivos. A resolução eficaz de um sinistro pode melhorar significativamente os custos e o tempo despendido, evitando o agravamento de prêmios ou custos adicionais para ambas as partes.\nSete dias de formação completos e intensivos em Luanda em academias de topo e num ambiente multicultural.',
        focus: 'Capacitar os participantes com conhecimentos e habilidades essenciais para lidar com sinistros de acidentes de trabalho de maneira eficaz.',
        dateLabel: 'Em breve', duration: '7 dias', modality: 'Presencial e online', venue: 'Luanda', language: 'Português', certificate: 'INEFOP',
        objectives: 'Enumerar as características de um sinistro no âmbito de acidentes de trabalho\nConhecer a legislação aplicável ao ramo de seguros de acidentes de trabalho\nAtribuir as funções pertinentes a cada um dos intervenientes num processo de sinistro\nAnalisar e organizar os processos de sinistros\nElaborar propostas de melhoria para os serviços do departamento de sinistros',
        audience: 'Profissionais de Seguros\nGestores de Recursos Humanos\nAdvogados\nConsultores de Segurança no Trabalho\nEmpresários e Gestores',
        program: 'Introdução à Gestão de Sinistros\nLegislação de Acidentes de Trabalho\nAnálise de Riscos\nPrevenção de Acidentes\nInvestigação de Acidentes\nApoio ao Trabalhador Acidentado\nGestão de Documentação e Relatórios\nEstudo de Casos Práticos',
        trainerIds: [T.esmael].filter(Boolean),
      },
      {
        slug: 'gestao-estrategica-de-organizacoes', title: 'Gestão Estratégica de Organizações', area: 'Gestão e liderança',
        status: 'done', featured: true, position: 2, price: 0, currency: 'AOA',
        shortDescription: 'Programa executivo para líderes: cenário económico, estratégia, inovação, liderança e ESG.',
        description: 'A Gestão Estratégica é o processo de gerir todos os recursos de uma organização para alcançar objetivos e metas. Representa a forma de envolver todas as funções organizacionais de uma empresa com foco em ações estratégicas que percorrem toda a estrutura funcional, de modo a alcançar a maior racionalidade e eficácia possível, maximizar os resultados e tornar a empresa mais competitiva.\nEste programa é oferecido pela Global Academy. Foi concebido com um ciclo de sessões sobre temas da atualidade e de relevância para líderes de organizações governamentais e empresariais.\nO programa proporciona aos gestores de topo uma experiência única, que visa desenvolver nos líderes habilidades, visão global e sistêmica, além de uma cultura empresarial competitiva.\nEste programa oferece competências a 360 graus, combinando teoria e prática na gestão das organizações, com foco na análise do ambiente interno e externo, na competitividade organizacional, na avaliação de estratégias, bem como na implantação e no acompanhamento dos processos.',
        focus: 'Análise de cenários económicos e tendências mundiais, do ponto de vista de liderança e gestão de pessoas em ambientes competitivos.',
        dateLabel: '10 de Junho de 2025', duration: '2 dias', modality: 'Presencial', venue: 'Luanda', language: 'Português', certificate: 'INEFOP',
        objectives: 'Desenvolver líderes empresariais com uma visão global e sistémica das atividades empresariais\nAnalisar o ambiente interno e externo e a competitividade organizacional\nAvaliar estratégias e acompanhar a sua implantação\nLiderar e gerir pessoas em ambientes competitivos',
        audience: 'Representantes dos mais altos níveis da gestão, incluindo PCAs, PCEs e Administradores de empresas\nEmpresários, executivos, consultores e professores universitários\nLíderes Top 20 do Mercado Angolano',
        program: 'ECONOMIC SCENARIO AND WORLD TRENDS\nSTRATEGIC BUSINESS MANAGEMENT\nARTIFICIAL INTELLIGENCE, CYBER SECURITY AND INNOVATION\nLEADERSHIP AND PEOPLE MANAGEMENT IN COMPETITIVE ENVIRONMENTS\nENTREPRENEURSHIP AND BUSINESS DEVELOPMENT\nESG STRATEGIES',
        trainerIds: [T.aguinaldo, T.relvas, T.coelho, T.siza, T.ayuk, T.chastre].filter(Boolean),
      },
      {
        slug: 'gestao-de-sinistros-seguro-automovel', title: 'Gestão de Sinistros (Seguro Automóvel)', area: 'Seguros',
        status: 'done', featured: true, position: 3, price: 0, currency: 'AOA',
        shortDescription: 'Ciclo completo do sinistro automóvel: regulação, avaliação de danos, aspetos legais e atendimento.',
        description: 'Esta formação teve como objetivo capacitar os participantes para atuarem com eficiência na gestão e regulação de sinistros automóveis, compreendendo processos técnicos, legais e operacionais. Foram trabalhados conteúdos como o funcionamento do seguro automóvel, ciclo completo de gestão de sinistros, análise documental, avaliação técnica de danos, aplicação de normativos legais e contratuais, prevenção de fraudes, comunicação com clientes e parceiros e utilização de ferramentas digitais.\nO curso foi direcionado para colaboradores de seguradoras, profissionais de corretoras, peritos de danos, estudantes, gestores de frota e profissionais em reconversão.\nQuatro horas de formação intensiva realizadas na Academia BAI, em um ambiente multicultural.',
        focus: 'Capacitar os participantes para atuarem de forma técnica, eficiente e ética na análise, regulação e resolução de sinistros automóveis.',
        dateLabel: '26 de Novembro de 2025', duration: '4 horas', modality: 'Presencial', venue: 'Sapiens, Luanda, Angola', language: 'Português', certificate: 'INEFOP',
        objectives: 'Compreender o funcionamento do seguro automóvel e o ciclo completo de um sinistro\nAvaliar danos e interpretar relatórios técnicos\nConhecer os aspetos legais e regulatórios\nLidar com clientes em momentos críticos\nUsar ferramentas digitais na gestão de sinistros',
        audience: 'Colaboradores de seguradoras\nProfissionais de corretoras\nPeritos de danos\nGestores de frota\nEstudantes e profissionais em reconversão',
        program: 'Introdução ao Seguro Automóvel\nO Processo de Sinistro\nRegulação e Avaliação de Danos\nAspetos Legais e Contratuais\nTecnologias e Ferramentas na Gestão de Sinistros\nÉtica, Qualidade e Atendimento ao Cliente',
        trainerIds: [T.prata].filter(Boolean),
      },
    ]);
    console.log('✔ Cursos criados (sem imagens de capa)');
  }

  /* ---------- Restante conteúdo da home ---------- */
  if (await empty('Highlight')) {
    await ds.getRepository('Highlight').save([
      { value: '500+', label: 'Participantes', icon: 'users', position: 1 },
      { value: '98%', label: 'de Satisfação', icon: 'smile', position: 2 },
      { value: 'Certificação', label: 'Incluída', icon: 'cert', position: 3 },
    ]);
  }
  if (await empty('WhyItem')) {
    await ds.getRepository('WhyItem').save([
      { title: 'Aprendizagem Prática', text: 'Exercícios e simulações reais.', icon: 'hands', position: 1 },
      { title: 'Especialistas de Mercado', text: 'Formadores com experiência comprovada.', icon: 'expert', position: 2 },
      { title: 'Certificação Reconhecida', text: 'Valorização profissional.', icon: 'badge', position: 3 },
      { title: 'Turmas Exclusivas', text: 'Mais interação e apoio individual.', icon: 'seat', position: 4 },
    ]);
  }
  if (await empty('Partner')) {
    // Entidades que constam nos certificados/parcerias dos cursos. Logótipos: enviar pelo painel.
    await ds.getRepository('Partner').save(['INEFOP', 'ISPTEC', 'Universidade de Coimbra', 'Unitel', 'Deloitte', 'Academia BAI'].map((name, i) => ({ name, position: i + 1 })));
  }
  if (await empty('PaymentMethod')) {
    await ds.getRepository('PaymentMethod').save([
      { name: 'Multicaixa Express', type: 'express', position: 1, instructions: 'Será encaminhado para concluir o pagamento no Multicaixa Express. Se não for redirecionado, pague para o número abaixo e indique a sua referência.', details: 'Telefone Express: (indicar)' },
      { name: 'Transferência bancária', type: 'transfer', position: 2, instructions: 'Faça a transferência e envie o comprovativo para o nosso email, indicando a referência da inscrição.', details: 'Titular: (indicar)\nIBAN: (indicar)\nBanco: (indicar)' },
      { name: 'Numerário (no local)', type: 'cash', position: 3, instructions: 'Pague na secretaria antes do início do curso.' },
    ]);
  }
  console.log('✔ Seed concluído');
  await ds.destroy();
}

main().catch((e) => { console.error(e); process.exit(1); });
