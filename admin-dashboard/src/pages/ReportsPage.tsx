import React from 'react';
import { Download, FileText, BarChart2, PieChart } from 'lucide-react';

export default function ReportsPage() {
  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Category,Bookings,Revenue (INR)\nFacial,54,48200\nWaxing,32,32100\nHair Care,28,22400\nMakeup,6,15600\nSpa,5,6260';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BeautyNest_Lucknow_Revenue_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Analytics &amp; Executive Reports
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Download revenue breakdowns, booking trends, and beautician performance metrics
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-pink-soft transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-primary" />
            <span>Revenue by Service Category</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 font-semibold text-gray-700">
                <span>Facials (Korean &amp; Gold)</span>
                <span>₹48,200 (39%)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[39%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 font-semibold text-gray-700">
                <span>Full Body &amp; Rica Waxing</span>
                <span>₹32,100 (26%)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-400 w-[26%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 font-semibold text-gray-700">
                <span>Hair Spa &amp; Keratin</span>
                <span>₹22,400 (18%)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 w-[18%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 font-semibold text-gray-700">
                <span>Bridal &amp; HD Party Makeup</span>
                <span>₹15,600 (12%)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-[12%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>Top Performing Doorstep Zones in Lucknow</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-pink-50/60 rounded-xl flex justify-between items-center">
              <div>
                <strong className="block text-gray-900">1. Aliganj &amp; Kapoorthala</strong>
                <span className="text-gray-500">88 Bookings completed</span>
              </div>
              <span className="font-bold text-brand-primary">₹44,800</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <strong className="block text-gray-900">2. Gomti Nagar &amp; Extension</strong>
                <span className="text-gray-500">76 Bookings completed</span>
              </div>
              <span className="font-bold text-gray-900">₹39,200</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <strong className="block text-gray-900">3. Hazratganj &amp; Mahanagar</strong>
                <span className="text-gray-500">52 Bookings completed</span>
              </div>
              <span className="font-bold text-gray-900">₹27,560</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
