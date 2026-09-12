import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Eye,
  X,
  Filter,
} from 'lucide-react';
import { INITIAL_CONSENT_FORMS, CustomerConsentForm } from '../lib/masterConfig';

export default function ConsentFormsPage() {
  const [consentForms, setConsentForms] = useState<CustomerConsentForm[]>(INITIAL_CONSENT_FORMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsent, setSelectedConsent] = useState<CustomerConsentForm | null>(null);

  const filtered = consentForms.filter(
    (c) =>
      c.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            SAFETY &amp; COMPLIANCE
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Customer Consent Forms &amp; Allergy Declarations
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pre-service legal declarations, skin sensitivity checklists, product authorizations, and digital signatures
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Mandatory Before Service Start</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-400 font-bold uppercase">Total Consents Logged</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{consentForms.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-400 font-bold uppercase">Allergies Flagged</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {consentForms.filter((c) => c.hasSkinAllergies).length}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-400 font-bold uppercase">Verified by Beauticians</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {consentForms.filter((c) => c.beauticianVerified).length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by booking number, customer or service..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
          />
        </div>
      </div>

      {/* Consent Forms Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-bold">Booking #</th>
                <th className="py-3.5 px-6 font-bold">Customer</th>
                <th className="py-3.5 px-6 font-bold">Service</th>
                <th className="py-3.5 px-6 font-bold">Allergies / Sensitivity</th>
                <th className="py-3.5 px-6 font-bold">Product Permission</th>
                <th className="py-3.5 px-6 font-bold">Digital Signed At</th>
                <th className="py-3.5 px-6 font-bold">Beautician Verification</th>
                <th className="py-3.5 px-6 text-right font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">{c.bookingId}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900 block">{c.customerName}</span>
                    <span className="text-[10px] text-gray-400">{c.customerPhone}</span>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">{c.serviceName}</td>
                  <td className="py-4 px-6">
                    {c.hasSkinAllergies ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Allergy Reported</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded text-[11px]">
                        Normal / Clean
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-emerald-700 font-semibold">✓ Authorized</span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 font-mono text-[11px]">{c.signedAt}</td>
                  <td className="py-4 px-6">
                    {c.beauticianVerified ? (
                      <div>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          ✓ Verified
                        </span>
                        {c.verifiedByWorker && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">by {c.verifiedByWorker}</span>
                        )}
                      </div>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        Pending Verification
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedConsent(c)}
                      className="text-[#0071E3] hover:underline font-bold text-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Form</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Consent Modal */}
      {selectedConsent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-blue-50/60">
              <div className="flex items-center gap-2 text-blue-950">
                <FileCheck className="w-5 h-5 text-[#0071E3]" />
                <h3 className="text-base font-bold font-serif">Customer Consent Declaration</h3>
              </div>
              <button
                onClick={() => setSelectedConsent(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl space-y-1.5 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedConsent.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedConsent.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-semibold text-gray-800">{selectedConsent.serviceName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Recorded Health &amp; Sensitivity Details:</h4>
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                  <p><strong>Allergies:</strong> {selectedConsent.hasSkinAllergies ? selectedConsent.allergyDetails : 'None'}</p>
                  <p><strong>Skin Sensitivity:</strong> {selectedConsent.skinSensitivityLevel}</p>
                  <p><strong>Pregnancy Declaration:</strong> {selectedConsent.isPregnant ? 'Yes' : 'No'}</p>
                  <p><strong>Product Application:</strong> Customer agreed to cosmetic application by BeautyNest certified professional.</p>
                  <p className="font-mono text-[10px] text-gray-500"><strong>Signed At:</strong> {selectedConsent.signedAt}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedConsent(null)}
                  className="bg-[#0071E3] text-white text-xs font-bold px-5 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
