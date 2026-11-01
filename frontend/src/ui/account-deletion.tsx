import { SiteButton } from './button'
import { Checkbox } from './shadcn/checkbox'
import { Input } from './shadcn/input'
import { Headline, Section } from './section'
import { DELETION } from './account-deletion.copy'

/** A plain form with the browser's own check, so it works without JavaScript;
 * the server checks the word again. Without JavaScript the checkbox does not
 * toggle, and the form takes the default, which erases everything. */
export function AccountDeletion({ canPublish }: { canPublish: boolean }) {
  return (
    <Section aria-labelledby="account-delete">
      <Headline id="account-delete">{DELETION.title}</Headline>
      <p>{DELETION.whatGoes}</p>
      <p>{DELETION.device}</p>
      <form
        action="/auth/delete"
        method="post"
        className="mt-md flex flex-col items-start gap-sm"
      >
        {canPublish && (
          <>
            <p>{DELETION.keepExplanation}</p>
            <Checkbox name="keep-comments">{DELETION.keep}</Checkbox>
          </>
        )}
        <label className="flex w-full flex-col gap-xs" htmlFor="confirm-delete">
          {DELETION.confirm}
          <Input
            id="confirm-delete"
            name="confirm"
            className="w-full"
            required
            // Any case, with spaces around: a phone keyboard capitalizes.
            pattern="\s*[Ee][Xx][Cc][Ll][Uu][Ii][Rr]\s*"
            autoComplete="off"
            autoCapitalize="characters"
          />
        </label>
        <SiteButton type="submit">{DELETION.submit}</SiteButton>
      </form>
    </Section>
  )
}
