import { createContext, useContext } from 'react'
import { deriveCapabilities } from './driverCapabilities'

// App-wide driver + capabilities context, populated once by AppLayout so pages
// can read business-type capabilities without re-fetching.
export const DriverContext = createContext({
  driver: null,
  businesses: [],
  capabilities: deriveCapabilities([]),
  loading: true,
  refreshBusinesses: async () => {}
})

export function useDriver() {
  return useContext(DriverContext)
}

// Convenience hook for pages that only need the capability flags.
export function useDriverCapabilities() {
  return useContext(DriverContext).capabilities
}
