# The deploy plan stays separate from SSH

As in the Festival (its `plano-do-deploy.ts` and `vps.ts`), the deploy is split in two parts. `frontend/scripts/deploy-plan.ts` builds, with no network and no disk, the steps of a publish or a rollback: what goes up to `envio/`, the bash script of each step (the image, GoatCounter, the blue/green swap) and what to do if a step fails. `frontend/scripts/vps.ts` follows the plan: it sends the files by `scp`, runs each script over `ssh` and writes the log.

The VPS paths come from `vpsPaths(root)`. On the VPS the root is `/`; in `vps.test.ts` it is a temporary folder, and the `docker`, `curl`, `nginx`, `systemctl`, `pgrep` and `sleep` on the `PATH` are fakes (`fake-docker.ts`). The test runs the same plan that goes to the VPS and covers the port swap, the rollback to the previous version, the new container that does not respond, the `nginx -t` that refuses and GoatCounter, inside `pnpm test`.

## Consequences

- The swap is still a bash script that runs whole on the VPS, inside `flock`. The plan does not read the VPS state beforehand: the free port and the old images are decided there, as before the split.
- The fake docker only knows what the scripts use. A new command in a script requires the same command in the fake, or the test fails.
- `stats.docker.test.ts` stays: it runs the GoatCounter script in a real Docker, outside `pnpm test`.
- On Windows, which has no bash, the fake VPS tests are skipped.
