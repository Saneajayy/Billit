import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hsnCode: z.string().optional().or(z.literal('')),
  unitPrice: z.number({ invalid_type_error: "Must be a number" }).min(0, 'Price must be positive'),
  gstRate: z.number().int().refine(val => [0, 5, 12, 18, 28].includes(val), 'Invalid GST rate'),
  unit: z.string().min(1, 'Unit is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const GST_RATES = [0, 5, 12, 18, 28];
const UNITS = ['pcs', 'kg', 'hr', 'month', 'project', 'unit', 'service'];

export default function Products() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchApi('/products', {}, getToken),
  });

  const mutation = useMutation({
    mutationFn: (newProduct: ProductFormValues) =>
      fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      }, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAdding(false);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      hsnCode: '',
      unitPrice: 0,
      gstRate: 18,
      unit: 'pcs',
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Products & Services</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Item</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#131316] p-6 rounded-xl border border-white/5 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">New Product/Service</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                  placeholder="Website Design / Audit / T-Shirt"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">HSN/SAC Code</label>
                <input
                  type="text"
                  {...register('hsnCode')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Unit Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('unitPrice', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
                />
                {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">GST Rate *</label>
                <select
                  {...register('gstRate', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-[#0B0B0C] text-white"
                >
                  {GST_RATES.map(rate => (
                    <option key={rate} value={rate}>{rate}%</option>
                  ))}
                </select>
                {errors.gstRate && <p className="text-red-500 text-xs mt-1">{errors.gstRate.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Unit Type *</label>
                <select
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-[#0B0B0C] text-white"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Item
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Item Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">HSN/SAC</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Unit Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">GST Rate</th>
              </tr>
            </thead>
            <tbody className="bg-[#131316] divide-y divide-white/5">
              {products?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No products found. Add your first product above.
                  </td>
                </tr>
              ) : (
                products?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{product.name}</div>
                      <div className="text-xs text-slate-400">per {product.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                      {product.hsnCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-300">
                      ₹{product.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {product.gstRate}%
                      </span>
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
