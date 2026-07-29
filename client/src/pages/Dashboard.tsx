import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, FileText, IndianRupee, PieChart, Users } from 'lucide-react';

export default function Dashboard() {
  const { getToken } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => fetchApi('/dashboard/summary', {}, getToken),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 m-6">
        <h3 className="text-lg font-bold mb-2">Failed to load dashboard</h3>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#131316] p-6 rounded-xl border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Invoices</p>
            <p className="text-2xl font-bold text-white">{data.totalInvoices}</p>
          </div>
        </div>

        <div className="bg-[#131316] p-6 rounded-xl border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Revenue (Taxable)</p>
            <p className="text-2xl font-bold text-white">₹{(data.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="bg-[#131316] p-6 rounded-xl border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Tax Collected (GST)</p>
            <p className="text-2xl font-bold text-white">₹{(data.tax?.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="bg-[#131316] p-6 rounded-xl border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Top Customers</p>
            <p className="text-2xl font-bold text-white">{data.topCustomers?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#131316] p-6 rounded-xl border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Trend (Last 6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  tick={{ fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0B0B0C', borderColor: '#ffffff10', color: '#fff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={3} dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#131316' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#131316] p-6 rounded-xl border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Top Customers by Revenue</h2>
          <div className="space-y-4">
            {!data.topCustomers || data.topCustomers.length === 0 ? (
              <p className="text-slate-400 text-sm">No data available yet.</p>
            ) : (
              data.topCustomers.map((customer: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-300 truncate w-32" title={customer.name}>{customer.name}</span>
                  </div>
                  <span className="font-semibold text-white">₹{(customer.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Tax Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">CGST</span>
                <span className="font-medium text-slate-200">₹{(data.tax?.cgst || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SGST</span>
                <span className="font-medium text-slate-200">₹{(data.tax?.sgst || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">IGST</span>
                <span className="font-medium text-slate-200">₹{(data.tax?.igst || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
