# Full state in the link's query, out of the log and with no gender in analytics

The share link carries the whole state (Profile, Requirements and Priorities) in the `?` query, not in the `#` fragment. The fragment would never reach the server. With the query, the server and social network previews can build the result. The cost is that gender, age and the orientation they imply pass through the server. Orientation counts as sensitive data under the LGPD, and the [legal basis research](../../reports/2026-10-18-lgpd-estado-link.md) showed that the initial plan (log and analytics with the full query, with only a notice and opt-out) had no basis in art. 11. So the server receives the query but does not store it with the Profile.

## Consequences

- The proxy and app logs record only the path, never the query. The exception is the Nginx error_log, which copies the request line when a failure happens. It only writes on those failures and is rotated daily, keeping 3 days.
- Analytics receives the event and the fields that do not reveal orientation, with 31-day retention (GoatCounter's minimum, which runs on the VPS itself) and opt-out. The pair own gender + sought gender never goes to analytics. The basis is the legitimate interest of art. 7, IX.
- The preview shows the result and who is sought, but never the Profile of whoever shared. It still goes through the platforms' bots, which do not store the gender of whoever shared. `Referrer-Policy: strict-origin` keeps the query from leaking to external sites.
- Changing the query format breaks links already circulating, so changing it later requires reading the old format too.
