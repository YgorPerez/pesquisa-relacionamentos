# 0046: Sync merges by entry, and a link stays on the device

## Context

Spec #556 carries the Perfil, Requisitos, Prioridades, Grifos, Notas and sent Comentários between a reader's devices, unencrypted. The merge must never lose data. A shared link replaces saved data on the device that opens it (ADR 0001), and that replacement can be someone else's Perfil.

## Decision

The account holds one JSON document in `account_sync`, keyed by entry (`profile`, `highlight:<id>`, `note:<id>`, `comment:<id>`), each with the time it changed. The newest entry wins, and a tie keeps the account's. The server holds times to its own clock.

**An absent entry never deletes.** Only an explicit removal does: "Tirar grifo", "Tirar da lista" or erasing the Perfil writes `value: null`, without the content, and that entry merges like any other. Without this a removed Grifo would return on the next exchange. A removal comes from the action, never from comparing lists, since a list can be short because this device never held the item. A Nota written after a removal renews its Grifo, which comes back.

**A received link stays on the device.** Its fields are marked and neither uploaded nor overwritten by the account, until the reader edits that field, which is the intent to keep it, or chooses "Voltar aos dados da conta". Clearing a field a link filled drops only the copy here: the account's version returns.

**Joining is per device.** The account's consent is asked once. Each other device joins with its own "Juntar e sincronizar", because its data is about to enter the account. A refusal sends nothing and may later become consent; a device can stop, which keeps both sides' data.

A device that never joined keeps no second copy of its data and makes no sync request. It keeps only the time of each Perfil, Requisitos and Prioridades edit.

## Consequences

Deleting the account row cascades to `account_sync`, so #562 needs nothing more than deleting by account id. A value saved before this release has no known time and loses to any timed account version. Notas and the edit keys of Comentários sit readable in the database, an accepted risk of the spec.
