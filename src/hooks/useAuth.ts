import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '@/contexts/auth-context'

/**
 * Hook bantuan untuk mengakses AuthContext di seluruh komponen.
 *
 * @returns Objek AuthContextType
 * @throws Error jika dipanggil di luar <AuthProvider>
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>')
  }
  return context
}