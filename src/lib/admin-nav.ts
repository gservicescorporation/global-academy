export interface AdminLink {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export const ADMIN_NAV_GROUPS: { label: string; links: AdminLink[] }[] = [
  {
    label: '',
    links: [{ href: '/admin', label: 'Visão geral', icon: 'grid', exact: true }],
  },
  {
    label: 'Vendas',
    links: [
      { href: '/admin/inscricoes', label: 'Inscrições', icon: 'list' },
      { href: '/admin/pagamentos', label: 'Pagamentos', icon: 'card' },
      { href: '/admin/mensagens', label: 'Mensagens', icon: 'mail' },
    ],
  },
  {
    label: 'Conteúdo',
    links: [
      { href: '/admin/cursos', label: 'Cursos', icon: 'book' },
      { href: '/admin/formadores', label: 'Formadores', icon: 'users' },
      { href: '/admin/topo', label: 'Destaques do topo', icon: 'star' },
      { href: '/admin/destaques', label: 'Números em destaque', icon: 'chart' },
      { href: '/admin/diferenciais', label: 'Porque escolher-nos', icon: 'hands' },
      { href: '/admin/testemunhos', label: 'Testemunhos', icon: 'quote' },
      { href: '/admin/parceiros', label: 'Empresas e parceiros', icon: 'link' },
    ],
  },
  {
    label: 'Configurações',
    links: [
      { href: '/admin/metodos-pagamento', label: 'Métodos de pagamento', icon: 'card' },
      { href: '/admin/definicoes', label: 'Conteúdo da página', icon: 'doc' },
      { href: '/admin/utilizadores', label: 'Utilizadores', icon: 'users' },
    ],
  },
];

export const ADMIN_NAV_INDEX = ADMIN_NAV_GROUPS.flatMap((g) => g.links.map((l) => ({ ...l, group: g.label })));
