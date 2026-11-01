import { useState } from 'react'
import { Sheet, Column, Display, Lead } from './sheet'
import { SiteButton } from './button'
import { Input } from './shadcn/input'
import { Checkbox } from './shadcn/checkbox'
import { Section, Headline } from './section'
import { ACCOUNT_INTRO, ACCOUNT_RULES } from './account.copy'

/** The account is separate from the device's Profile. */
export function AccountPage({
  account,
}: {
  account: { nickname: string | null } | null
}) {
  const [adult, setAdult] = useState(false)
  const [rules, setRules] = useState(false)
  const [nickname, setNickname] = useState('')
  return (
    <Sheet>
      <Column>
        <Display>Sua conta</Display>
        <Lead>{ACCOUNT_INTRO}</Lead>
        {!account ? (
          <Section>
            <a
              href="/auth/google"
              className="inline-flex min-h-toque items-center font-bold"
            >
              Entrar com Google
            </a>
          </Section>
        ) : (
          <>
            {account.nickname === null ? (
              <Section aria-labelledby="account-nickname">
                <Headline id="account-nickname">
                  Como você quer aparecer?
                </Headline>
                <p>
                  O apelido será público nos comentários que você publicar.
                  Evite usar seu nome completo.
                </p>
                <form
                  action="/auth/nickname"
                  method="post"
                  className="mt-md flex flex-col items-start gap-sm"
                >
                  <label
                    className="flex w-full flex-col gap-xs"
                    htmlFor="nickname"
                  >
                    Apelido
                    <Input
                      id="nickname"
                      name="nickname"
                      className="w-full"
                      minLength={2}
                      maxLength={40}
                      required
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      autoComplete="off"
                    />
                  </label>
                  <p>{ACCOUNT_RULES}</p>
                  <Checkbox
                    name="adult"
                    checked={adult}
                    onCheckedChange={setAdult}
                  >
                    Declaro ter 18 anos ou mais
                  </Checkbox>
                  <Checkbox
                    name="rules"
                    checked={rules}
                    onCheckedChange={setRules}
                  >
                    Li e aceito as regras acima
                  </Checkbox>
                  <p className="text-nota text-tinta-2">
                    A idade é uma declaração sua; o site não a verifica.
                  </p>
                  <SiteButton
                    type="submit"
                    disabled={!adult || !rules || nickname.trim().length < 2}
                  >
                    Criar apelido
                  </SiteButton>
                </form>
              </Section>
            ) : (
              <Section>
                <p>Você entrou como {account.nickname}.</p>
              </Section>
            )}
            <form action="/auth/logout" method="post" className="mt-lg">
              <SiteButton type="submit" variant="light">
                Sair da conta
              </SiteButton>
            </form>
          </>
        )}
        <p className="mt-lg text-nota text-tinta-2">
          Sair da conta mantém o que está salvo neste aparelho.{' '}
          <a href="/privacidade">Veja o que o site guarda.</a>
        </p>
      </Column>
    </Sheet>
  )
}
