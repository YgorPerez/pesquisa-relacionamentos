import { describe, expect, it } from 'vite-plus/test'
import type { Profile } from './profile.ts'
import { appliesToYou, type Coverage, type Verdict } from './applies-to-you.ts'

const HETERO: Coverage = {
  generos: ['homem', 'mulher'],
  procura: ['homens', 'mulheres'],
  casal: 'hetero',
}
const SAME_SEX: Coverage = {
  generos: ['homem', 'mulher'],
  procura: ['homens', 'mulheres'],
  casal: 'mesmo-sexo',
}
const UNSCOPED: Coverage = {}
const YOUNG: Coverage = {
  generos: ['homem', 'mulher'],
  idades: { min: 18, max: 35 },
}
const ONLY_HUSBANDS: Coverage = { generos: ['homem'], procura: ['mulheres'] }
const ONLY_SEEKING_MEN: Coverage = { procura: ['homens'] }

const manMen: Profile = { genero: 'homem', procura: 'homens', idade: 30 }
const manWomen: Profile = {
  genero: 'homem',
  procura: 'mulheres',
  idade: 30,
}
const womanMen: Profile = { genero: 'mulher', procura: 'homens', idade: 24 }
const womanWomen: Profile = {
  genero: 'mulher',
  procura: 'mulheres',
  idade: 24,
}
const other: Profile = { genero: 'outro', procura: 'homens', idade: 30 }
const manBoth: Profile = { genero: 'homem', procura: 'ambos', idade: 30 }
const womanBoth: Profile = { genero: 'mulher', procura: 'ambos', idade: 50 }
const only40: Profile = { idade: 40 }
const onlyMan: Profile = { genero: 'homem' }

const YES: Verdict = { covered: true }
const NO: Verdict = { covered: false }
const SIDE_MEN: Verdict = { covered: true, only: 'homens' }
const SIDE_WOMEN: Verdict = { covered: true, only: 'mulheres' }

describe('appliesToYou: profiles × coverage', () => {
  it.each<[string, Profile, Coverage, Verdict]>([
    // The couple's pair (#16): the lists alone would let it through.
    ['man seeking men × straight couples only', manMen, HETERO, NO],
    ['man seeking men × same-sex couples', manMen, SAME_SEX, YES],
    ['man seeking women × straight couples only', manWomen, HETERO, YES],
    ['man seeking women × same-sex couples', manWomen, SAME_SEX, NO],
    ['woman seeking men × straight couples only', womanMen, HETERO, YES],
    ['woman seeking women × same-sex couples', womanWomen, SAME_SEX, YES],
    ['woman seeking women × straight couples only', womanWomen, HETERO, NO],
    // Gender and who is sought.
    ['woman × study of men only', womanMen, ONLY_HUSBANDS, NO],
    [
      'man seeking women × study of men seeking women only',
      manWomen,
      ONLY_HUSBANDS,
      YES,
    ],
    [
      'man seeking women × study of people seeking men',
      manWomen,
      ONLY_SEEKING_MEN,
      NO,
    ],
    // "outro" only matches what did not split by gender.
    ['other × unscoped study', other, UNSCOPED, YES],
    ['other × study that split men and women', other, YOUNG, NO],
    ['other × straight couples only', other, HETERO, NO],
    [
      'other × study that only split people seeking men',
      other,
      ONLY_SEEKING_MEN,
      YES,
    ],
    // "ambos" applies if one of the sides is covered, and says which.
    ['man seeking both × straight couples only', manBoth, HETERO, SIDE_WOMEN],
    ['man seeking both × same-sex couples', manBoth, SAME_SEX, SIDE_MEN],
    ['man seeking both × unscoped study', manBoth, UNSCOPED, YES],
    [
      'man seeking both × study of people seeking men',
      manBoth,
      ONLY_SEEKING_MEN,
      SIDE_MEN,
    ],
    ['woman seeking both × straight couples only', womanBoth, HETERO, SIDE_MEN],
    ['woman seeking both × study of men only', womanBoth, ONLY_HUSBANDS, NO],
    // Age.
    ['30 years old × study of 18 to 35', manWomen, YOUNG, YES],
    ['50 years old × study of 18 to 35', womanBoth, YOUNG, NO],
    [
      '35 years old × study of 18 to 35 (the edge counts)',
      { ...manWomen, idade: 35 },
      YOUNG,
      YES,
    ],
    // Half a profile: what was not said is not checked.
    ['age only × straight couples', only40, HETERO, YES],
    ['age only × study of 18 to 35', only40, YOUNG, NO],
    ['gender only × same-sex couples', onlyMan, SAME_SEX, YES],
    ['gender only × study of men only', onlyMan, ONLY_HUSBANDS, YES],
  ])('%s', (_, profile, coverage, expected) => {
    expect(appliesToYou(profile, [coverage])).toEqual(expected)
  })
})

describe('appliesToYou with more than one coverage', () => {
  it("applies if one of the finding's coverages covers the profile", () => {
    expect(appliesToYou(manMen, [HETERO, SAME_SEX])).toEqual(YES)
    expect(appliesToYou(manMen, [HETERO, ONLY_HUSBANDS])).toEqual(NO)
  })

  it('with "ambos", the sides of each coverage add up', () => {
    expect(appliesToYou(manBoth, [HETERO, SAME_SEX])).toEqual(YES)
    expect(appliesToYou(manBoth, [HETERO, HETERO])).toEqual(SIDE_WOMEN)
  })

  it('with no coverage at all, there is no data for the profile', () => {
    expect(appliesToYou(manMen, [])).toEqual(NO)
  })
})

describe('appliesToYou without a profile', () => {
  it('decides nothing: only the "Vale para:" note stays', () => {
    expect(appliesToYou(null, [HETERO])).toBeNull()
    expect(appliesToYou({}, [HETERO])).toBeNull()
  })
})
