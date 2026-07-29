import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../lib/api';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').or(z.literal('')),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string().or(z.literal('')),
  billingState: z.string().length(2, 'State code must be 2 digits'),
  billingAddress: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function Customers() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchApi('/customers', {}, getToken),
  });

  const mutation = useMutation({
    mutationFn: (newCustomer: CustomerFormValues) =>
      fetchApi('/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      }, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAdding(false);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useReactHookForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      gstin: '',
      email: '',
      phone: '',
      billingState: '',
      billingAddress: '',
    }
  });

  const onSubmit = (data: CustomerFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Customer</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#131316] p-6 rounded-xl border border-white/5 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">New Customer</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company / Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                  placeholder="Acme Corp"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">GSTIN</label>
                <input
                  type="text"
                  {...register('gstin')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow uppercase bg-[#0B0B0C] text-white"
                  placeholder="29ABCDE1234F1Z5"
                  onChange={(e) => {
                    // Auto-derive billing state from first 2 digits
                    const val = e.target.value;
                    if (val.length >= 2) {
                      const stateCode = val.substring(0, 2);
                      if (!isNaN(Number(stateCode))) {
                        reset((values) => ({ ...values, billingState: stateCode, gstin: val }));
                      }
                    }
                  }}
                />
                {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Billing State Code (e.g. 29) *</label>
                <input
                  type="text"
                  {...register('billingState')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                  maxLength={2}
                />
                {errors.billingState && <p className="text-red-500 text-xs mt-1">{errors.billingState.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Billing Address</label>
                <textarea
                  {...register('billingAddress')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="bg-[#131316] border border-white/5 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#0B0B0C]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">GSTIN</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">State</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-[#131316] divide-y divide-white/5">
              {customers?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No customers found. Add your first customer above.
                  </td>
                </tr>
              ) : (
                customers?.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{customer.name}</div>
                      {customer.email && <div className="text-sm text-slate-400">{customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                      {customer.gstin || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {customer.billingState}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {customer.phone || 'N/A'}
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
