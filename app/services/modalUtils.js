export default class ModalUtils {
  constructor(useState, useEffect) {
    const [loading, setLoading] = useState([])
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
    return this.loading.length > 0
  }

  getLoadingMessage() {
    return this.loading[this.loading.length-1]
  }

  isError() {
    return this.error
  }

  load(loadingMessage, promise) {
    const loading1 = this.loading
    loading1.push(loadingMessage)
    this.setLoading(loading1)
    this.setError(undefined)

    return promise.then(result => {
      const loading2 = this.loading
      loading2.pop()
      this.setLoading(loading2)
      if (this.error) {
        this.setError(false)
      }
      return result
    }).catch(error => this.setError(error.message))
  }
}
