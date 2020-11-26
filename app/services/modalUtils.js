export default class ModalUtils {
  constructor(useState, useEffect) {
    const [loading, setLoading] = useState(false)
    this.loading = loading
    this.setLoading = setLoading

    const [error, setError] = useState(false)
    this.error = error
    this.setError = setError

    useEffect(() => {
      if (error) {
        setLoading(false)
      }
    }, [error])

    useEffect(() => {
      console.log('modalUtils: loading='+loading+', error='+error)
    }, [loading,error])
  }

  isLoading() {
    return this.loading
  }

  isError() {
    return this.error
  }

  load(loadingMessage, promise) {
    this.loading = loadingMessage
    this.error = undefined

    return promise.then(result => {
      this.setLoading(false)
      if (this.error) {
        this.setError(false)
      }
      return result
    }).catch(error => this.setError(error.message))
  }
}
