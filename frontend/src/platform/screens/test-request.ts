// The screen tests' `@tanstack/react-start/server` (ADR 0035), next to
// `test-server.ts`: a server function that reads its request finds here the
// one a reader behind Nginx would send. Only what the app uses.

const HEADERS: Readonly<Record<string, string>> = {
  'x-forwarded-for': '203.0.113.7',
}

export function getRequestHeader(name: string): string | undefined {
  return HEADERS[name.toLowerCase()]
}

export function getRequestIP(): string | undefined {
  return '127.0.0.1'
}
