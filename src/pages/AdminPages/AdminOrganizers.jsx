import React, { useState, useEffect } from 'react'
import API from '../../services/api'
import usePagination from '../../hooks/usePagination'
import AdminPagination from '../../components/admin/AdminPagination'
import {
  Building2,
  Search,
  RefreshCw,
  CreditCard,
  Calendar,
  Mail,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react'

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchOrganizers = async () => {
    setLoading(true)
    try {
      let url = 'admin/organizers/'
      if (search) url += `?search=${encodeURIComponent(search)}`
      const res = await API.get(url)
      setOrganizers(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizers()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchOrganizers()
  }

  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedOrganizers,
    goToPage,
    setPageSize,
  } = usePagination(organizers, { initialPageSize: 12, resetDeps: [search] })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Studio & Creator Directory
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Verified host studios, aggregated revenue ledger, and active payout settlement accounts.
          </p>
        </div>
        <button
          onClick={fetchOrganizers}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-xs font-mono transition shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search studio name, email, handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-900 transition"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-mono rounded-lg hover:bg-stone-800 transition"
          >
            Find
          </button>
        </form>

        <span className="text-xs font-mono text-stone-500">
          {organizers.length} verified creator studio(s)
        </span>
      </div>

      {/* Organizers Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-stone-500 bg-white rounded-xl border border-stone-200/80 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading studio directory...</span>
        </div>
      ) : organizers.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-stone-400 bg-white rounded-xl border border-stone-200/80">
          No creator studios found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedOrganizers.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-xl border border-stone-200/80 shadow-2xs p-5 space-y-4 hover:border-stone-900 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800 font-bold border border-stone-200">
                          <Building2 size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-serif font-bold text-sm text-stone-900 truncate max-w-[170px]">
                          {org.organizationName}
                        </h3>
                        <span className="text-[11px] font-mono text-stone-500">@{org.handle}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200 shrink-0 flex items-center gap-1">
                      <ShieldCheck size={10} />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Financial Snapshot */}
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200/80 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Gross Sales</div>
                      <div className="font-bold text-stone-900 mt-0.5">{org.totalGross}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">Available</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{org.availableBalance}</div>
                    </div>
                  </div>

                  {/* Contact and Settlement */}
                  <div className="space-y-2 text-xs text-stone-600 font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-stone-400 shrink-0" />
                      <span className="truncate">{org.supportEmail || org.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <CreditCard size={13} className="text-stone-400 shrink-0" />
                      <span className="text-stone-800 font-medium truncate">{org.primarySettlement || 'No primary payout'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-stone-400 shrink-0" />
                      <span>{org.totalEvents} hosted stage(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white rounded-xl border border-stone-200/80 shadow-2xs overflow-hidden">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24, 48]}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
              itemLabel="studios"
            />
          </div>
        </div>
      )}
    </div>
  )
}

