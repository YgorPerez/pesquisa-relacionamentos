import type {
  CuratorComment,
  CuratorDesk,
} from '#/content/public-comment-record'

const comment: CuratorComment = {
  id: 1,
  parentId: null,
  path: '/dicas/exemplo',
  quote: 'O lugar quase não muda a relação.',
  body: 'Isso vale para quem mora no interior?',
  nickname: 'Leitora',
  createdAt: Date.UTC(2026, 9, 30, 15),
  editedAt: null,
  hidden: false,
  reports: 0,
  issue: null,
  notifyFailed: false,
  history: [],
}

export const CURATOR_DESK: CuratorDesk = {
  pending: [
    {
      ...comment,
      id: 3,
      body: 'Um comentário que três contas denunciaram.',
      hidden: true,
      reports: 3,
      issue: 41,
    },
    {
      ...comment,
      id: 2,
      body: 'Um comentário com uma denúncia, ainda no ar.',
      reports: 1,
      notifyFailed: true,
    },
  ],
  recent: [
    {
      ...comment,
      editedAt: Date.UTC(2026, 9, 31, 15),
      history: [
        {
          body: 'A primeira versão do texto.',
          replacedAt: Date.UTC(2026, 9, 31, 15),
        },
      ],
    },
    {
      ...comment,
      id: 4,
      parentId: 1,
      nickname: 'leitor removido',
      body: 'Uma resposta de quem apagou a conta.',
    },
  ],
  before: 4,
}
