import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Membersihkan DOM setelah setiap test agar tidak saling memengaruhi
afterEach(() => {
  cleanup()
})