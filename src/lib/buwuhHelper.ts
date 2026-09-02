import type {
  ApiBuwuhan,
  ApiOwnerBuwuhan,
  BuwuhanCategory,
  BuwuhanUnit,
} from '@/types/invitation-api'

/**
 * Mengidentifikasi kategori bantuan (Uang, Beras, Barang) dari item buwuhan.
 */
export function getBuwuhanCategory(item: {
  category?: string | null
  itemName?: string
  unit?: string
}): BuwuhanCategory {
  const cat = (item.category ?? '').trim().toLowerCase()
  const name = (item.itemName ?? '').trim().toLowerCase()

  if (
    cat === 'uang' ||
    cat === 'money' ||
    cat === 'cash' ||
    name.includes('uang') ||
    name.includes('amplop') ||
    name.includes('tunai') ||
    name.includes('rupiah') ||
    name.includes('transfer') ||
    name.includes('qris')
  ) {
    return 'Uang'
  }

  if (
    cat === 'beras' ||
    cat === 'rice' ||
    name.includes('beras') ||
    name.includes('gabah') ||
    name.includes('padi') ||
    name.includes('ketan')
  ) {
    return 'Beras'
  }

  return 'Barang'
}

/**
 * Satuan rekomendasi berdasarkan jenis bantuan yang dipilih.
 */
export const CATEGORY_UNITS: Record<BuwuhanCategory, BuwuhanUnit[]> = {
  Uang: ['transaksi', 'unit'],
  Beras: ['kg', 'karung', 'liter', 'gram'],
  Barang: ['unit', 'pack', 'box', 'ekor', 'jasa', 'transaksi'],
}

export type BuwuhStats = {
  totalMoney: number
  moneyTransactions: number
  totalRiceKg: number
  riceTransactions: number
  totalGoodsCount: number
  goodsTransactions: number
  totalEstimatedValue: number
}

/**
 * Menghitung akumulasi statistik: Total Uang, Total Beras, dan Total Barang
 * dari seluruh daftar transaksi buwuh.
 */
export function calculateBuwuhStats(records: (ApiBuwuhan | ApiOwnerBuwuhan)[]): BuwuhStats {
  let totalMoney = 0
  let moneyTransactions = 0

  let totalRiceKg = 0
  let riceTransactions = 0

  let totalGoodsCount = 0
  let goodsTransactions = 0

  let totalEstimatedValue = 0

  for (const record of records) {
    let hasMoney = false
    let hasRice = false
    let hasGoods = false

    for (const item of record.items) {
      const category = getBuwuhanCategory(item)
      const estVal = item.estimatedValue ?? 0
      totalEstimatedValue += estVal

      if (category === 'Uang') {
        hasMoney = true
        totalMoney += estVal > 0 ? estVal : item.quantity
      } else if (category === 'Beras') {
        hasRice = true
        totalRiceKg += item.quantity
      } else {
        hasGoods = true
        totalGoodsCount += item.quantity
      }
    }

    if (hasMoney) moneyTransactions += 1
    if (hasRice) riceTransactions += 1
    if (hasGoods) goodsTransactions += 1
  }

  return {
    totalMoney,
    moneyTransactions,
    totalRiceKg,
    riceTransactions,
    totalGoodsCount,
    goodsTransactions,
    totalEstimatedValue,
  }
}
