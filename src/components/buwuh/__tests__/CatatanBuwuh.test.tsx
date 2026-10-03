import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CatatanBuwuhEventTab } from '../CatatanBuwuhEventTab'
import { CatatanBuwuhMandiriTab } from '../CatatanBuwuhMandiriTab'
import * as useInvitationsModule from '@/hooks/useInvitations'
import * as useBuwuhanModule from '@/hooks/useBuwuhan'
import * as useStandaloneBuwuhanModule from '@/hooks/useStandaloneBuwuhan'
import type { InvitationSummary } from '@/types/dashboard'
import type { ApiBuwuhan } from '@/types/invitation-api'

vi.mock('@/hooks/useInvitations')
vi.mock('@/hooks/useBuwuhan')
vi.mock('@/hooks/useStandaloneBuwuhan')

describe('CatatanBuwuhEventTab', () => {
  const mockInvitations: InvitationSummary[] = [
    {
      id: 'inv-active',
      slug: 'budi-siti-active',
      coupleName: 'Budi & Siti (Aktif)',
      eventDate: '2026-12-12',
      eventTime: '08:00',
      thumbnailUrl: null,
      status: 'ACTIVE',
      guestCount: 100,
      checkedInCount: 50,
      title: 'Undangan Pernikahan Budi & Siti',
    },
    {
      id: 'inv-draft',
      slug: 'andi-mega-draft',
      coupleName: 'Andi & Mega (Draft)',
      eventDate: '2027-01-01',
      eventTime: '09:00',
      thumbnailUrl: null,
      status: 'DRAFT',
      guestCount: 0,
      checkedInCount: 0,
      title: 'Undangan Khitanan Andi',
    },
    {
      id: 'inv-completed-1',
      slug: 'dimas-putri-completed',
      coupleName: 'Dimas & Putri (Selesai 1)',
      eventDate: '2026-05-10',
      eventTime: '10:00',
      thumbnailUrl: null,
      status: 'COMPLETED',
      guestCount: 200,
      checkedInCount: 180,
      title: 'The Wedding of Dimas & Putri',
    },
    {
      id: 'inv-completed-2',
      slug: 'reza-maya-completed',
      coupleName: 'Reza & Maya (Selesai 2)',
      eventDate: '2026-06-15',
      eventTime: '11:00',
      thumbnailUrl: null,
      status: 'COMPLETED',
      guestCount: 150,
      checkedInCount: 140,
      title: 'The Wedding of Reza & Maya',
    },
  ]

  const mockBuwuhanRecords: ApiBuwuhan[] = [
    {
      id: 'buwuh-1',
      invitationId: 'inv-completed-1',
      giverName: 'Bpk. Ahmad Junaedi',
      giverAddress: 'Surabaya',
      note: 'Selamat menempuh hidup baru',
      receivedAt: '2026-05-10T10:30:00.000Z',
      createdAt: '2026-05-10T10:30:00.000Z',
      updatedAt: '2026-05-10T10:30:00.000Z',
      items: [
        {
          id: 'item-1',
          buwuhanId: 'buwuh-1',
          category: 'Uang',
          itemName: 'Amplop Pernikahan',
          quantity: 1,
          unit: 'transaksi',
          estimatedValue: 500000,
          createdAt: '2026-05-10T10:30:00.000Z',
        },
      ],
    },
  ]

  it('HANYA menampilkan event yang berstatus selesai di dropdown dan menyaring event DRAFT/ACTIVE', () => {
    vi.spyOn(useInvitationsModule, 'useInvitations').mockReturnValue({
      invitations: mockInvitations,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    vi.spyOn(useBuwuhanModule, 'useBuwuhan').mockReturnValue({
      records: mockBuwuhanRecords,
      summary: {
        totalItems: 1,
        totalTransactions: 1,
        totalEstimatedValue: 500000,
        totalItemsThisMonth: 1,
        topItem: null,
      },
      addBuwuhan: vi.fn(),
      updateBuwuhan: vi.fn(),
      removeBuwuhan: vi.fn(),
      isLoading: false,
      isError: false,
      isMutating: false,
    })

    render(
      <MemoryRouter>
        <CatatanBuwuhEventTab />
      </MemoryRouter>,
    )

    // Periksa bahwa dropdown hanya memiliki 2 opsi (event yang status COMPLETED)
    const select = screen.getByRole('combobox')
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)

    expect(options[0].textContent).toContain('Dimas & Putri')
    expect(options[1].textContent).toContain('Reza & Maya')

    // Pastikan event ACTIVE dan DRAFT sama sekali tidak ada di dalam dropdown
    expect(select.innerHTML).not.toContain('Budi & Siti')
    expect(select.innerHTML).not.toContain('Andi & Mega')

    // Menampilkan data buwuh event terpilih
    expect(screen.getByText('Bpk. Ahmad Junaedi')).toBeInTheDocument()
    expect(screen.getAllByText('Rp 500.000').length).toBeGreaterThanOrEqual(1)
  })

  it('menampilkan empty state jika tidak ada event yang berstatus selesai', () => {
    vi.spyOn(useInvitationsModule, 'useInvitations').mockReturnValue({
      invitations: [mockInvitations[0], mockInvitations[1]], // Hanya DRAFT & ACTIVE
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter>
        <CatatanBuwuhEventTab />
      </MemoryRouter>,
    )

    expect(screen.getByText('Belum Ada Acara yang Selesai')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})

describe('CatatanBuwuhMandiriTab', () => {
  const mockStandaloneRecords: ApiBuwuhan[] = [
    {
      id: 'std-1',
      invitationId: null,
      giverName: 'H. Sukirno',
      giverAddress: 'Kediri',
      note: 'Titipan hajatan',
      receivedAt: '2026-08-01T14:00:00.000Z',
      createdAt: '2026-08-01T14:00:00.000Z',
      updatedAt: '2026-08-01T14:00:00.000Z',
      items: [
        {
          id: 'item-2',
          buwuhanId: 'std-1',
          category: 'Beras',
          itemName: 'Beras Ramos',
          quantity: 25,
          unit: 'kg',
          estimatedValue: 350000,
          createdAt: '2026-08-01T14:00:00.000Z',
        },
      ],
    },
  ]

  it('merender data catatan buwuh mandiri dengan benar', () => {
    vi.spyOn(useStandaloneBuwuhanModule, 'useStandaloneBuwuhan').mockReturnValue({
      records: mockStandaloneRecords,
      addBuwuhan: vi.fn(),
      updateBuwuhan: vi.fn(),
      removeBuwuhan: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isMutating: false,
    })

    render(
      <MemoryRouter>
        <CatatanBuwuhMandiriTab />
      </MemoryRouter>,
    )

    expect(screen.getByText('Catatan Buwuh Mandiri')).toBeInTheDocument()
    expect(screen.getByText('H. Sukirno')).toBeInTheDocument()
    expect(screen.getByText('Beras Ramos')).toBeInTheDocument()
    expect(screen.getAllByText('25 kg').length).toBeGreaterThanOrEqual(1)
  })
})
