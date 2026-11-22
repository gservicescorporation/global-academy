import type { Field } from './fields';

export type SettingDef = Field & { default: string; group: string };

const t = (group: string, name: string, label: string, def: string, type: Field['type'] = 'text', help?: string): SettingDef =>
  ({ group, name, label, type, default: def, help, rows: type === 'textarea' ? 3 : undefined });

const ACCENT = 'Ponha entre *asteriscos* a palavra a mostrar em itálico (no máximo uma por título).';

export const SETTINGS: SettingDef[] = [
  t('Marca', 'site_name', 'Nome do site', 'Global Academy'),
  t('Marca', 'logo_url', 'Logótipo', '/images/logo.png', 'image', 'PNG com fundo transparente. No topo e no rodapé é mostrado em branco automaticamente.'),
  t('Marca', 'parent_company', 'Empresa-mãe', 'Global Services Corporation'),
  t('Marca', 'site_tagline', 'Descrição curta (rodapé e SEO)', 'Cursos presenciais e online de seguros, gestão e liderança, em Luanda. Certificação INEFOP.', 'textarea'),

  t('Topo', 'hero_eyebrow', 'Linha acima do título', 'Formação profissional em Luanda'),
  t('Topo', 'hero_title', 'Título', 'Cursos de seguros, gestão e liderança.', 'text', 'Usado quando não há “Destaques do topo” publicados.'),
  t('Topo', 'hero_title_accent', 'Título (continuação, em itálico)', 'Com certificado INEFOP.'),
  t('Topo', 'hero_subtitle', 'Subtítulo', 'Turmas pequenas, formadores que trabalham no sector e certificado no fim. Presencial em Luanda ou online.', 'textarea'),
  t('Topo', 'hero_cta_primary', 'Botão principal', 'Ver cursos'),
  t('Topo', 'hero_cta_secondary', 'Botão secundário', 'Formação para empresas'),
  t('Topo', 'hero_image', 'Imagem de fundo', '', 'image', 'Usada quando não há “Destaques do topo” publicados.'),
  t('Topo', 'hero_images', 'Galeria de fundo (rotativa)', '', 'gallery', 'Alternativa aos “Destaques do topo”: várias fotos com o mesmo título.'),

  t('Apresentação', 'manifesto', 'Texto de apresentação (página inicial)', 'Cada curso indica o que vai aprender, quanto tempo dura, quanto custa e que certificado recebe. Os formadores trabalham na área que ensinam e as turmas são pequenas, para haver tempo para as suas perguntas.', 'textarea', 'Texto grande que se “acende” com o scroll. Duas ou três frases.'),

  t('Cursos em destaque', 'featured_title', 'Título', 'Os cursos com *mais procura.*', 'text', ACCENT),
  t('Cursos em destaque', 'featured_subtitle', 'Texto de apoio', 'Data, duração, modalidade e preço em cada curso. Escolha e reserve o seu lugar.', 'textarea'),

  t('Áreas', 'areas_title', 'Título', 'Escolha por *área.*', 'text', ACCENT),
  t('Áreas', 'areas_text', 'Texto de apoio', 'Os cursos estão organizados por área. Cada área mostra quantos cursos tem disponíveis.', 'textarea'),

  t('Diferencial', 'diff_title', 'Título', 'Teoria, prática e *casos reais* em cada sessão.', 'text', ACCENT),
  t('Diferencial', 'diff_text', 'Texto', 'As sessões combinam exposição, exercícios e estudos de caso, com acompanhamento do formador do princípio ao fim.', 'textarea'),
  t('Diferencial', 'diff_bullets', 'Lista de pontos', 'Estudos de caso baseados em empresas reais\nMaterial e ferramentas para levar para o trabalho\nApoio do formador depois do curso', 'textarea', 'Um ponto por linha.'),
  t('Diferencial', 'diff_image', 'Imagem 1', '', 'image'),
  t('Diferencial', 'diff_image_2', 'Imagem 2', '', 'image'),
  t('Diferencial', 'diff_image_3', 'Imagem 3', '', 'image'),

  t('Porque escolher-nos', 'why_title', 'Título', 'Turmas pequenas, *formadores do sector.*', 'text', ACCENT),
  t('Porque escolher-nos', 'why_subtitle', 'Texto de apoio', 'O que encontra em todos os cursos da academia.', 'textarea'),

  t('Formadores', 'trainers_title', 'Título', 'Quem *ensina.*', 'text', ACCENT),
  t('Formadores', 'trainers_text', 'Texto de apoio', 'Profissionais com experiência no tema de cada curso.', 'textarea'),

  t('Próximas turmas', 'upcoming_title', 'Título', 'Próximas *turmas.*', 'text', ACCENT),

  t('Testemunhos', 'testimonials_title', 'Título', 'O que dizem os *formandos.*', 'text', ACCENT),

  t('Empresas', 'partners_title', 'Título da faixa de logótipos', 'Empresas e entidades que formam connosco'),
  t('Empresas', 'companies_title', 'Formação para empresas — título', 'Formação à medida para a *sua equipa.*', 'text', ACCENT),
  t('Empresas', 'companies_text', 'Formação para empresas — texto', 'Adaptamos o programa, a data e o local à sua empresa. Diga-nos o tema, o número de pessoas e o prazo, e enviamos uma proposta com conteúdos, duração e orçamento.', 'textarea'),
  t('Empresas', 'companies_points', 'Formação para empresas — pontos', 'Programa ajustado ao trabalho da equipa\nNas vossas instalações, nas nossas ou online\nCertificado para cada participante', 'textarea', 'Um ponto por linha.'),

  t('Sobre', 'about_title', 'Título da página Sobre', 'A academia de formação da *Global Services Corporation.*', 'text', ACCENT),
  t('Sobre', 'about_subtitle', 'Texto de apoio', 'Cursos curtos e práticos para profissionais e equipas de empresa, com certificação INEFOP.', 'textarea'),

  t('Chamada final', 'final_title', 'Título', 'Escolha o curso e *reserve o lugar.*', 'text', ACCENT),
  t('Chamada final', 'final_text', 'Texto', 'Cada turma tem vagas limitadas. A inscrição fica confirmada depois do pagamento.', 'textarea'),
  t('Chamada final', 'final_cta', 'Botão', 'Ver cursos'),

  t('Cursos', 'candidacy_title', 'Bloco de certificação — título', 'Certificação e candidatura'),
  t('Cursos', 'candidacy_text', 'Bloco de certificação — texto', 'Com uma taxa de aprovação de 100% nas candidaturas, asseguramos que seus objetivos sejam plenamente alcançados, independentemente da sua localização. Estamos presentes em todo o território nacional.\nAnalisamos o cumprimento dos requisitos prévios, elaboramos e submetemos a sua candidatura, disponibilizando também, se necessário, a formação adicional legalmente requerida.', 'textarea', 'Mostrado em todos os cursos que tenham entidade certificadora.'),

  t('Contactos', 'contact_email', 'Email', 'geral@gservicescorporation.com'),
  t('Contactos', 'contact_phone', 'Telefone', '+244 941 064 919'),
  t('Contactos', 'contact_phone_2', 'Telefone fixo', '+244 222 731 031'),
  t('Contactos', 'contact_whatsapp', 'WhatsApp (só números, com indicativo)', '244941064919'),
  t('Contactos', 'contact_address', 'Morada', 'Rua Dr. Aleixo de Abreu, Luanda — Angola', 'textarea'),
  t('Contactos', 'contact_hours', 'Horário de atendimento', 'Segunda a sexta, 08h00 – 17h00'),
  t('Contactos', 'contact_intro', 'Texto da página de contactos', 'Diga-nos o que procura. Um consultor responde por email ou telefone.', 'textarea'),

  t('Redes sociais', 'social_facebook', 'Facebook (URL)', 'https://www.facebook.com/p/Global-Services-Corporation-100094301594638/'),
  t('Redes sociais', 'social_instagram', 'Instagram (URL)', 'https://www.instagram.com/globalservicescorporation/'),
  t('Redes sociais', 'social_linkedin', 'LinkedIn (URL)', 'https://ao.linkedin.com/company/global-service-corporations'),
];
