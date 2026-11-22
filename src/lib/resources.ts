import { ICON_OPTIONS, type Field } from './fields';

export interface Resource {
  key: string;           // segmento do URL: /admin/<key>
  entity: string;        // nome da entidade TypeORM
  title: string;
  singular: string;
  fields: Field[];
  listColumns: string[];
  order: Record<string, 'ASC' | 'DESC'>;
  slugFrom?: string;
}

export const resources: Record<string, Resource> = {
  formadores: {
    key: 'formadores', entity: 'Trainer', title: 'Formadores', singular: 'formador',
    listColumns: ['photoUrl', 'name', 'role', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'role', label: 'Função / especialidade', type: 'text', required: true },
      { name: 'bio', label: 'Biografia', type: 'textarea', rows: 4 },
      { name: 'photoUrl', label: 'Fotografia', type: 'image' },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  topo: {
    key: 'topo', entity: 'HeroSlide', title: 'Destaques do topo', singular: 'destaque',
    listColumns: ['imageUrl', 'title', 'published', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, help: 'Curto e concreto: o que se aprende ou o que acontece. Ex.: “Gestão de sinistros automóvel — nova turma em março”.' },
      { name: 'description', label: 'Texto', type: 'textarea', rows: 3, help: 'Uma ou duas frases: a quem serve, duração, data.' },
      { name: 'imageUrl', label: 'Imagem de fundo', type: 'image', required: true, help: 'Fotografia larga (mín. 2000 px). O lado esquerdo é escurecido automaticamente para o texto ficar legível.' },
      { name: 'link', label: 'Ligação do botão', type: 'text', help: 'Ex.: /cursos/gestao-de-sinistros-seguro-automovel. Vazio: sem botão.' },
      { name: 'buttonText', label: 'Texto do botão', type: 'text', help: 'Ex.: Ver o curso' },
      { name: 'published', label: 'Publicado', type: 'boolean', default: true },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  testemunhos: {
    key: 'testemunhos', entity: 'Testimonial', title: 'Testemunhos', singular: 'testemunho',
    listColumns: ['photoUrl', 'name', 'company', 'published', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'quote', label: 'Testemunho', type: 'textarea', rows: 4, required: true, help: 'As palavras reais do formando, com autorização para publicar.' },
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'role', label: 'Função', type: 'text', help: 'Ex.: Gestora de sinistros' },
      { name: 'company', label: 'Empresa', type: 'text' },
      { name: 'photoUrl', label: 'Fotografia', type: 'image', help: 'Opcional. Sem foto, mostramos as iniciais.' },
      { name: 'published', label: 'Publicado', type: 'boolean', default: true },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  destaques: {
    key: 'destaques', entity: 'Highlight', title: 'Números em destaque', singular: 'número',
    listColumns: ['value', 'label', 'icon', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'value', label: 'Valor', type: 'text', required: true, help: 'Só números verificáveis. Ex.: 320+ (o número conta até ao valor quando aparece), INEFOP. Os números animam-se; texto aparece como está.' },
      { name: 'label', label: 'Legenda', type: 'text', required: true, help: 'Ex.: Participantes' },
      { name: 'icon', label: 'Ícone', type: 'select', options: ICON_OPTIONS, default: 'users' },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  diferenciais: {
    key: 'diferenciais', entity: 'WhyItem', title: 'Porque escolher-nos', singular: 'item',
    listColumns: ['title', 'text', 'icon', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'text', label: 'Texto', type: 'textarea', rows: 3, required: true },
      { name: 'icon', label: 'Ícone', type: 'select', options: ICON_OPTIONS, default: 'hands' },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  parceiros: {
    key: 'parceiros', entity: 'Partner', title: 'Empresas e parceiros', singular: 'empresa',
    listColumns: ['logoUrl', 'name', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'logoUrl', label: 'Logótipo', type: 'image', help: 'Opcional. Sem logótipo, o nome é mostrado em texto. Será exibido em escala de cinza.' },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
  'metodos-pagamento': {
    key: 'metodos-pagamento', entity: 'PaymentMethod', title: 'Métodos de pagamento', singular: 'método de pagamento',
    listColumns: ['name', 'type', 'enabled', 'position'], order: { position: 'ASC' },
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, help: 'Ex.: Multicaixa Express' },
      {
        name: 'type', label: 'Tipo', type: 'select', required: true, default: 'transfer',
        options: [
          { value: 'express', label: 'Express (pagamento online integrado)' },
          { value: 'reference', label: 'Referência de pagamento' },
          { value: 'transfer', label: 'Transferência bancária' },
          { value: 'cash', label: 'Numerário / no local' },
        ],
      },
      { name: 'instructions', label: 'Instruções ao participante', type: 'textarea', rows: 4, help: 'Mostradas após a inscrição.' },
      { name: 'details', label: 'Dados de pagamento', type: 'textarea', rows: 4, help: 'IBAN, entidade, titular, telefone Express, etc.' },
      { name: 'enabled', label: 'Ativo', type: 'boolean', default: true },
      { name: 'position', label: 'Ordem', type: 'number', default: 0 },
    ],
  },
};
