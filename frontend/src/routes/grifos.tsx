import { createFileRoute, redirect } from '@tanstack/react-router'

// `/grifos` (#335) became "Seus trechos", at `/trechos` (#347): a 301 from
// the server and a redirect for a link followed inside the app.
export const Route = createFileRoute('/grifos')({
  beforeLoad: () => {
    throw redirect({ to: '/trechos', statusCode: 301, replace: true })
  },
})
