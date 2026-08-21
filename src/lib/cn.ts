import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilitas untuk menggabungkan class CSS secara kondisional dan aman dari konflik class Tailwind.
 * Mengombinasikan `clsx` (untuk logika kondisional class) dan `tailwind-merge` (untuk deduplikasi conflict class).
 * 
 * @param inputs - Daftar nama class, ekspresi ternary, objek boolean, atau array class
 * @returns String class CSS gabungan yang telah dibersihkan
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}