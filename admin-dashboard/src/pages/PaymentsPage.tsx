import React from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function PaymentsPage() {
  const transactions = [
    { id: 'tx-1', date: 'Today, 11:32 AM', customer: 'Ritu Singh', amount: 949, type: 'Razorpay UPI', status: 'Captured', beauticianPayout: 759 },
    { id: 'tx-2', date: 'Today, 12:05 PM', customer: 'Neha Verma', amount: 1299, type: 'Razorpay Card', status: 'Captured', beauticianPayout: 1039 },
    { id: 'tx-3', date: 'Today, 01:34 PM', customer: 'Pooja Tandon', amount: 2499, type: 'Razorpay UPI', status: 'Captured', beauticianPayout: 1999 },
    { id: 'tx-4', date: 'Today, 02:10 PM', customer: 'Kavita Mishra', amount: 789, type: 'Cash on Delivery', status: 'Pending Collection', beauticianPayout: 631 },
  ];

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      <div>
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Payments &amp; Financial Ledger
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Razorpay transaction logs, 80/20 beautician commission splits, and automated bank payouts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-400 uppercase font-semibold">Total Gross Volume</span>
          <div className="text-2xl font-bold text-gray-900 mt-2">₹1,24,560</div>
          <span className="text-xs text-emerald-600 font-bold">100% verified transactions</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-400 uppercase font-semibold">Beautician Payouts (80%)</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">₹99,648</div>
          <span className="text-xs text-gray-500">Scheduled for Friday NEFT</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-400 uppercase font-semibold">Platform Net Revenue (20%)</span>
          <div className="text-2xl font-bold text-brand-primary mt-2">₹24,912</div>
          <span className="text-xs text-gray-500">After payment gateway charges</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-gray-900">Transaction Logs</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-6">Tx ID</th>
              <th className="py-3.5 px-6">Timestamp</th>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Method</th>
              <th className="py-3.5 px-6">Gross Amount</th>
              <th className="py-3.5 px-6">Pro Payout (80%)</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-pink-50/30">
                <td className="py-4 px-6 font-mono font-bold text-gray-900">{tx.id}</td>
                <td className="py-4 px-6 text-gray-500">{tx.date}</td>
                <td className="py-4 px-6 font-semibold text-gray-900">{tx.customer}</td>
                <td className="py-4 px-6 text-gray-700">{tx.type}</td>
                <td className="py-4 px-6 font-bold text-gray-900">₹{tx.amount}</td>
                <td className="py-4 px-6 font-bold text-emerald-600">₹{tx.beauticianPayout}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
