export const debounce = (func, delay = 300) => {
  let timeoutId

  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

import { useEffect, useRef } from 'react'

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = require('react').useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
