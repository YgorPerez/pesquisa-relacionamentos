// Os testes leem os CSV de fixture como texto, pelo `?raw` do Vite.
declare module '*.csv?raw' {
  const texto: string
  export default texto
}
