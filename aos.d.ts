declare module 'aos' {
  interface Aos {
    init(options?: any): void
  }

  const aos: Aos
  export default aos
}
