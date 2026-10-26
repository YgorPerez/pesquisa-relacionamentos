import { describe, expect, it } from 'vite-plus/test'
import {
  isLink,
  linkSentence,
  readLink,
  prioritiesPreview,
  groupPreview,
  groupImage,
  linkQuery,
  type LinkState,
} from './link.ts'
import { DEFAULT_REQUIREMENTS, type Requirements } from './requirements.ts'

const ALL: Requirements = {
  age: { min: 25, max: 35 },
  place: { state: 'SP', municipality: '3550308' },
  noLiveInPartner: false,
  education: 'superior',
  income: '5+',
  colors: ['preta', 'parda'],
  religions: ['umbanda-candomble', 'sem-religiao'],
  noChildren: true,
  notWithParents: true,
  work: 'negocio',
  ownsHome: true,
  height: { min: 160, max: 200 },
  nonSmoker: true,
  drinking: ['nunca', 'raramente'],
  exercises: true,
  goodTeeth: true,
  nonVaper: true,
  office: true,
}

/** What a link from before the PNS lifestyle Requirements carries: all of
 * them off. */
const BEFORE_LIFESTYLE: Partial<Requirements> = {
  drinking: [],
  exercises: false,
  goodTeeth: false,
  nonVaper: false,
}

describe('round trip', () => {
  it('the possible group comes back equal, with the profile and every requirement', () => {
    const state: LinkState = {
      calculator: 'grupo-possivel',
      profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
      requirements: ALL,
    }
    expect(readLink('grupo-possivel', linkQuery(state))).toEqual(state)
  })

  it('without a profile and without touching the requirements, the link carries only the version', () => {
    const state: LinkState = {
      calculator: 'grupo-possivel',
      profile: null,
      requirements: null,
    }
    expect(linkQuery(state)).toBe('v=1')
    expect(readLink('grupo-possivel', 'v=1')).toEqual(state)
  })

  it('default requirements take no room in the query and come back as "never touched"', () => {
    const query = linkQuery({
      calculator: 'grupo-possivel',
      profile: { age: 40 },
      requirements: DEFAULT_REQUIREMENTS,
    })
    expect(query).toBe('v=1&idade=40')
    expect(readLink('grupo-possivel', query)).toEqual({
      calculator: 'grupo-possivel',
      profile: { age: 40 },
      requirements: null,
    })
  })

  it('priorities come back with the top 3 in order, the outcome and the gender', () => {
    const state: LinkState = {
      calculator: 'prioridades',
      gender: 'mulher',
      priorities: { top3: ['renda', 'sexo', 'calma'], outcome: 'duracao' },
    }
    const query = linkQuery(state)
    expect(query).toBe(
      'v=1&genero=mulher&topo=renda,sexo,calma&desfecho=duracao',
    )
    expect(readLink('prioridades', query)).toEqual(state)
  })

  it('priorities without a gender carry only the top 3 and the outcome', () => {
    const state: LinkState = {
      calculator: 'prioridades',
      gender: null,
      priorities: { top3: ['humor'], outcome: 'satisfacao' },
    }
    expect(linkQuery(state)).toBe('v=1&topo=humor&desfecho=satisfacao')
    expect(readLink('prioridades', linkQuery(state))).toEqual(state)
  })

  it('the income "5+" survives escaping and also arrives without it', () => {
    const r = { ...DEFAULT_REQUIREMENTS, income: '5+' as const }
    const query = linkQuery({
      calculator: 'grupo-possivel',
      profile: null,
      requirements: r,
    })
    expect(query).toBe('v=1&renda=5%2B')
    expect(readLink('grupo-possivel', '?v=1&renda=5+')).toEqual({
      calculator: 'grupo-possivel',
      profile: null,
      requirements: r,
    })
  })
})

describe('old versions', () => {
  // Links copied from version 1, as they circulate. If one of these breaks,
  // whoever got an old link opens the wrong page: write a new reader.
  it('a version 1 possible group link opens the same state', () => {
    expect(
      readLink(
        'grupo-possivel',
        '?v=1&genero=homem&procura=mulheres&idade=30&idades=25-35&uf=SP&municipio=3550308&companheiro=nao' +
          '&escolaridade=superior&renda=5%2B&cor=preta,parda&religiao=umbanda-candomble,sem-religiao' +
          '&sem-filhos=sim&altura=160-200&nao-fuma=sim&escritorio=sim',
      ),
    ).toEqual({
      calculator: 'grupo-possivel',
      profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
      // The Requirements that came after this link stay off.
      requirements: {
        ...ALL,
        ...BEFORE_LIFESTYLE,
        notWithParents: false,
        work: null,
        ownsHome: false,
      },
    })
  })

  it('a version 1 priorities link opens the top 3 and the gender, without the rest of the profile', () => {
    // Before #23 the priorities link carried the whole profile; the count
    // only uses the gender.
    expect(
      readLink(
        'prioridades',
        'v=1&genero=homem&procura=ambos&idade=33&topo=gentileza,humor&desfecho=atracao',
      ),
    ).toEqual({
      calculator: 'prioridades',
      gender: 'homem',
      priorities: { top3: ['gentileza', 'humor'], outcome: 'atracao' },
    })
  })
})

describe('invalid query', () => {
  it('without a version, with an unknown version or one that does not decode, it is not a link', () => {
    expect(readLink('grupo-possivel', '')).toBeNull()
    expect(readLink('grupo-possivel', 'genero=homem&idade=30')).toBeNull()
    expect(readLink('grupo-possivel', 'v=99&genero=homem')).toBeNull()
    expect(readLink('prioridades', 'v=1&topo=%E0%A4%A')).toBeNull()
  })

  it('an invalid value drops out and the rest of the link holds', () => {
    expect(
      readLink(
        'grupo-possivel',
        'v=1&genero=robo&procura=mulheres&idade=12&escolaridade=doutorado&uf=XX&cor=azul,preta',
      ),
    ).toEqual({
      calculator: 'grupo-possivel',
      profile: { seeks: 'mulheres' },
      requirements: { ...DEFAULT_REQUIREMENTS, colors: ['preta'] },
    })
    expect(
      readLink('grupo-possivel', 'v=1&idades=50-20&altura=100-300'),
    ).toEqual({
      calculator: 'grupo-possivel',
      profile: null,
      requirements: DEFAULT_REQUIREMENTS,
    })
  })

  it('the top 3 keeps up to three existing ids, without repeats; an unknown outcome becomes satisfaction', () => {
    expect(
      readLink(
        'prioridades',
        'v=1&topo=renda,renda,<b>,sexo,calma,humor&desfecho=amor',
        ['renda', 'sexo', 'humor'],
      ),
    ).toEqual({
      calculator: 'prioridades',
      gender: null,
      priorities: {
        top3: ['renda', 'sexo', 'humor'],
        outcome: 'satisfacao',
      },
    })
  })

  it('the opt-out key never goes or comes back through the link', () => {
    const query = 'v=1&nao-contar=sim&contar=nao&genero=mulher'
    const state = readLink('grupo-possivel', query)
    expect(state).toEqual({
      calculator: 'grupo-possivel',
      profile: { gender: 'mulher' },
      requirements: null,
    })
    expect(linkQuery(state!)).toBe('v=1&genero=mulher')
  })
})

describe('linkSentence', () => {
  const NAMES = {
    renda: 'Renda',
    sexo: 'Química sexual',
    calma: 'Estabilidade emocional',
  }

  it('says the profile and what is sought, as in the story 63 example', () => {
    const r = {
      ...DEFAULT_REQUIREMENTS,
      age: { min: 25, max: 35 },
      place: { state: 'SP' as const },
      education: 'superior' as const,
    }
    expect(
      linkSentence({
        calculator: 'grupo-possivel',
        profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
        requirements: r,
      }),
    ).toBe(
      'Este link mostra: homem, 30, procura mulheres de 25 a 35, ensino superior, em SP.',
    )
  })

  it('names each off-default requirement and the municipality by name', () => {
    expect(
      linkSentence(
        {
          calculator: 'grupo-possivel',
          profile: { gender: 'outro' },
          requirements: ALL,
        },
        { municipality: 'São Paulo' },
      ),
    ).toBe(
      'Este link mostra: outro gênero, procura pessoas de 25 a 35, mora ou não com companheiro(a), ensino superior, ' +
        'mais de 5 salários mínimos, cor preta ou parda, religião umbanda ou candomblé ou sem religião, sem filhos, não mora com os pais, tem negócio próprio, tem casa própria, ' +
        'a partir de 160 cm, não fuma, bebe nunca ou menos de 1 vez por semana, ' +
        'faz 150 min de exercício por semana, saúde bucal boa, não usa cigarro eletrônico, trabalha em escritório, ' +
        'em São Paulo (SP).',
    )
  })

  it('without a profile or requirements, it says the link carries nothing of yours', () => {
    expect(
      linkSentence({
        calculator: 'grupo-possivel',
        profile: null,
        requirements: null,
      }),
    ).toBe('Este link mostra só a conta do Brasil inteiro, sem nada seu.')
  })

  it('for priorities, the gender, the top 3 by name and the outcome', () => {
    expect(
      linkSentence(
        {
          calculator: 'prioridades',
          gender: 'mulher',
          priorities: {
            top3: ['renda', 'sexo', 'calma'],
            outcome: 'duracao',
          },
        },
        { names: NAMES },
      ),
    ).toBe(
      'Este link mostra: mulher, topo 3 renda, química sexual e estabilidade emocional, em duração.',
    )
    expect(
      linkSentence({
        calculator: 'prioridades',
        gender: null,
        priorities: { top3: [], outcome: 'satisfacao' },
      }),
    ).toBe('Este link mostra: nenhuma característica escolhida, em satisfação.')
  })
})

describe('social preview', () => {
  const count = {
    target: 'women' as const,
    result: { min: 123_400, max: 178_900 },
  }
  const man30 = {
    gender: 'homem' as const,
    seeks: 'mulheres' as const,
    age: 30,
  }

  it('the possible group shows the range and who is sought, as in the spec example', () => {
    const r = {
      ...DEFAULT_REQUIREMENTS,
      age: { min: 25, max: 35 },
      place: { state: 'SP' as const },
      nonSmoker: true,
    }
    expect(
      groupPreview(
        { calculator: 'grupo-possivel', profile: man30, requirements: r },
        count,
      ),
    ).toEqual({
      title: 'Entre 120 mil e 180 mil mulheres de 25 a 35 em SP',
      description:
        'Pela conta do Grupo possível, com o Censo 2022 e a PNS 2019. Também pediu: não fuma. Faça a sua conta.',
    })
  })

  it("never carries the sharer's gender or age, nor the age taken from it", () => {
    const preview = groupPreview(
      { calculator: 'grupo-possivel', profile: man30, requirements: null },
      count,
    )
    expect(preview.title).toBe(
      'Entre 120 mil e 180 mil mulheres no Brasil, na idade procurada',
    )
    const text = `${preview.title} ${preview.description}`
    expect(text).not.toMatch(/homem|homens|30|25|35|interessa/)
  })

  it('the municipality comes in by name', () => {
    const r = {
      ...DEFAULT_REQUIREMENTS,
      place: { state: 'SP' as const, municipality: '3550308' },
    }
    const preview = groupPreview(
      { calculator: 'grupo-possivel', profile: null, requirements: r },
      { target: 'people', result: { min: 900, max: 1_100 } },
      { municipality: 'São Paulo' },
    )
    expect(preview.title).toBe('Entre 900 e 1,1 mil pessoas em São Paulo (SP)')
  })

  it('priorities show the top 3 and the alert, without the profile', () => {
    const traits = [
      {
        id: 'renda',
        name: 'Renda',
        attraction: { level: 2 },
        satisfaction: { level: 0 },
        duration: { level: 0 },
      },
      {
        id: 'sexo',
        name: 'Química sexual',
        attraction: { level: 3 },
        satisfaction: { level: 3 },
        duration: { level: 1 },
      },
    ] as const
    const preview = prioritiesPreview(traits, {
      top3: ['sexo', 'renda'],
      outcome: 'satisfacao',
    })
    expect(preview).toEqual({
      title: 'Topo 3: química sexual e renda',
      description:
        'No seu topo 3, para satisfação: para renda não há boa evidência.',
    })
    expect(
      prioritiesPreview(traits, { top3: ['sexo'], outcome: 'atracao' })
        ?.description,
    ).toBe(
      'Para atração, a evidência não põe nenhuma delas em "quase nada" ou "não sabemos".',
    )
    expect(
      prioritiesPreview(traits, { top3: [], outcome: 'atracao' }),
    ).toBeNull()
  })
})

describe('isLink', () => {
  it('recognizes the query with a version, valid or not, and leaves the others', () => {
    expect(isLink('?v=1&genero=homem')).toBe(true)
    expect(isLink('v=99')).toBe(true)
    expect(isLink('v=1&x=%E0%A4%A')).toBe(true)
    expect(isLink('utm_source=zap')).toBe(false)
    expect(isLink('')).toBe(false)
  })
})

describe('share image', () => {
  const count = {
    target: 'women' as const,
    result: { min: 123_400, max: 178_900, unstable: false },
  }

  it('shows the range, who is sought and the other Requirements the link carries', () => {
    const query =
      'v=1&genero=homem&procura=mulheres&idade=30&idades=25-35&uf=SP&escolaridade=superior&nao-fuma=sim'
    expect(groupImage(query, count)).toEqual({
      before: 'Entre',
      numbers: '120 mil e 180 mil',
      unstable: false,
      who: 'mulheres de 25 a 35 em SP',
      also: ['ensino superior', 'não fuma'],
    })
  })

  it("never shows the sharer's gender or age, nor the age range taken from it", () => {
    const image = groupImage('v=1&genero=homem&procura=mulheres&idade=30', {
      ...count,
      result: { min: 1_000, max: 1_000, unstable: true },
    })
    expect(image).toEqual({
      before: 'Cerca de',
      numbers: '1 mil',
      unstable: true,
      who: 'mulheres no Brasil, na idade procurada',
      also: [],
    })
    expect(JSON.stringify(image)).not.toMatch(/homem|homens|30|25|35/)
  })

  it('shows nothing the link does not carry: an unknown key stays out', () => {
    const image = groupImage('v=1&procura=mulheres&peso=nao-obeso', count)
    expect(image?.also).toEqual([])
    expect(JSON.stringify(image)).not.toMatch(/peso|obes/)
  })

  it('is null for a query that is not a link', () => {
    expect(groupImage('utm_source=zap', count)).toBeNull()
  })
})
