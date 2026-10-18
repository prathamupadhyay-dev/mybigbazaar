import { lazy } from 'react'

export function lazyRetry(componentImport, key = 'module') {
  return lazy(() =>
    componentImport().catch((error) => {
      console.warn(`Chunk load error for ${key}. Checking if page reload needed...`, error)
      const storageKey = `chunk_retry_${key}`
      const hasRetried = sessionStorage.getItem(storageKey)

      if (!hasRetried) {
        sessionStorage.setItem(storageKey, 'true')
        window.location.reload()
        return new Promise(() => {}) // keep in loading state until reload
      }

      sessionStorage.removeItem(storageKey)
      throw error
    })
  )
}
