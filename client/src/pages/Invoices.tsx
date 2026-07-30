import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../lib/api';
import { Plus, Loader2, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Invoices() {
  const { getToken } = useAuth();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchApi('/invoices', {}, getToken),
    refetchInterval: (query) => {
      const data = query.state.data as any[] | undefined;
      const hasPendingPdf = data?.some((inv: any) => !inv.pdfUrl);
      return hasPendingPdf ? 3000 : false;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      case 'ISSUED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'OVERDUE': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <Link
          to="/dashboard/invoices/new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-[#131316] border border-white/5 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#0B0B0C]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice No.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#131316] divide-y divide-white/5">
              {invoices?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-slate-400 mb-3" />
                      <p>No invoices found. Create your first invoice.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices?.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{invoice.customer.name}</div>
                      <div className="text-xs text-slate-400">{invoice.isInterState ? 'Inter-state' : 'Intra-state'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      ₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invoice.pdfUrl ? (
                        <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                          <Download className="w-4 h-4 mr-1" /> PDF
                        </a>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Generating PDF...</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
