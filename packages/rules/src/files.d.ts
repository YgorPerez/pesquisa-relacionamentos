// The tests read the fixture CSVs as text, through Vite's `?raw`.
declare module '*.csv?raw' {
  const text: string
  export default text
}
