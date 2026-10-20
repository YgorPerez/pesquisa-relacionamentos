# The deploy checks the assets from outside

The Festival once had the site live pointing at a deleted bundle: the HTML cited `assets/index-*.js` and the server answered with the error page, in HTML, with status 200. Since then its deploy checks from outside (`conferir-no-ar.ts`) that the bundle arrives as JavaScript.

Here the last step of `publicar` and `voltar` in `deploy.yml` runs `node scripts/check-live.ts temestudo.cloud <sha>`. Over the internet, it checks:

- that `https://temestudo.cloud/?check=<sha>` responds 200 with `Referrer-Policy: strict-origin`;
- that each `/assets/*.js` and `/assets/*.css` cited in the page responds 200 with its type (`javascript`, `text/css`), and not with HTML;
- that `http://temestudo.cloud/?x=1` leads to `https://temestudo.cloud/?x=1`.

It retries every 5 s, for up to 60 s, because the container has just been swapped. If it does not pass, the job fails with the reason.

## Consequences

- The earlier check, with `curl` in the workflow, only saw the header and the redirect. It is contained in this one.
- The page must cite at least one `/assets/*.js`. A parked domain page, or a build without a bundle, fails.
- The assets' `content-type` comes from Nitro, which serves `public/` through Node. If Nginx starts serving the assets from disk, the check still holds without change.
