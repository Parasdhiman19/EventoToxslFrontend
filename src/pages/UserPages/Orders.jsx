import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Ticket, Calendar, DollarSign, Download, Printer, X, ExternalLink } from 'lucide-react'
import API from '../../services/api'
import ReceiptModal from '../../components/modals/ReceiptModal'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchOrders = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const res = await API.get('tickets/user/orders/')
        if (isMounted && Array.isArray(res.data)) {
          setOrders(res.data)
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.detail || 'Failed to load purchase invoices.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchOrders()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
            Order History &amp; Receipts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track past checkouts, payment receipts, and download purchase invoices.
          </p>
        </div>

        {orders.length > 0 && (
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-stone-300 bg-white px-3.5 py-2 text-xs font-mono font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer w-full sm:w-fit text-center inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Printer size={13} />
            <span>Print Statement</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-stone-200 rounded" />
          <div className="h-10 w-full bg-stone-100 rounded" />
          <div className="h-10 w-full bg-stone-100 rounded" />
        </div>
      ) : fetchError ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-xs text-red-700 space-y-2">
          <p className="font-semibold">{fetchError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-stone-900 underline font-mono"
          >
            Click to retry
          </button>
        </div>
      ) : orders.length > 0 ? (
        /* Orders Table / Cards */
        <section className="rounded-lg border border-stone-200/80 bg-white shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 text-[11px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200/80">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Order ID &amp; Date</th>
                  <th className="px-5 py-3.5 font-medium">Event &amp; Passes</th>
                  <th className="px-5 py-3.5 font-medium">Payment Gateway</th>
                  <th className="px-5 py-3.5 font-medium">Total Paid</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-normal">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Order ID & Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-stone-900">{order.id}</div>
                      <div className="text-[11px] font-mono text-stone-400">
                        {order.date} • {order.time}
                      </div>
                    </td>

                    {/* Event & Pass Tier */}
                    <td className="px-5 py-4 min-w-[240px]">
                      <div className="font-medium text-stone-900 text-sm leading-snug">{order.eventTitle || order.event}</div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {order.tier} &times; {order.quantity || order.qty}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-stone-600 text-[11px]">
                      {order.paymentMethod || 'Instant Pass'}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {order.total}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${
                          order.status === 'Confirmed' || order.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'Refunded'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3 font-mono">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(order)}
                          className="text-stone-900 font-semibold hover:underline underline-offset-2 cursor-pointer"
                        >
                          Receipt
                        </button>
                        <Link
                          to="/user/tickets"
                          className="text-stone-500 hover:text-stone-900 underline underline-offset-2"
                        >
                          Passes &rarr;
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden p-4 space-y-3 divide-y divide-stone-100">
            {orders.map((order, idx) => (
              <div key={order.id} className={idx > 0 ? 'pt-4 space-y-3' : 'space-y-3'}>
                {/* Header: Order ID, Timestamp & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-semibold text-xs text-stone-900 block">{order.id}</span>
                    <span className="text-[11px] font-mono text-stone-400">{order.date} • {order.time}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border shrink-0 ${
                      order.status === 'Confirmed' || order.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : order.status === 'Refunded'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Event & Pass Details */}
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 space-y-1">
                  <h3 className="font-medium text-stone-900 text-xs">{order.eventTitle || order.event}</h3>
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Pass Tier:</span>
                    <span className="text-stone-700">{order.tier} &times; {order.quantity || order.qty}</span>
                  </div>
                </div>

                {/* Financial & Payment Gateway */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-stone-100/60 border border-stone-200/40">
                    <span className="text-[10px] uppercase text-stone-400 block">Payment Method</span>
                    <span className="text-stone-700 truncate block">{order.paymentMethod || 'Instant Pass'}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-100/60 border border-stone-200/40">
                    <span className="text-[10px] uppercase text-stone-400 block">Total Paid</span>
                    <span className="font-semibold text-stone-900">{order.total}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(order)}
                    className="flex-1 py-2 px-3 rounded-md bg-stone-900 text-stone-50 text-xs font-mono font-medium hover:bg-stone-800 text-center cursor-pointer shadow-2xs"
                  >
                    View Receipt
                  </button>
                  <Link
                    to="/user/tickets"
                    className="flex-1 py-2 px-3 rounded-md border border-stone-300 bg-white text-stone-700 text-xs font-mono font-medium hover:bg-stone-50 text-center"
                  >
                    My Passes &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-stone-300 p-16 text-center space-y-4 bg-white">
          <div className="h-12 w-12 mx-auto rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
            <Receipt size={24} />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg font-medium text-stone-900">No purchase orders found</p>
            <p className="text-xs text-stone-500">When you book tickets for any experience, your invoices will show here.</p>
          </div>
          <Link
            to="/discover"
            className="inline-block rounded-md bg-stone-900 px-5 py-2.5 text-xs font-mono font-medium uppercase tracking-wider text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs"
          >
            Explore Events &rarr;
          </Link>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  )
}