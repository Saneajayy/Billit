import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../lib/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const invoiceItemSchema = z.object({
  productId: z.string().uuid('Please select a product'),
  quantity: z.number({ invalid_type_error: "Must be a number" }).min(0.01, 'Quantity > 0'),
});

const invoiceSchema = z.object({
  customerId: z.string().uuid('Please select a customer'),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
  dueDate: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function InvoiceCreate() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetchApi('/onboarding', { method: 'GET' }, getToken).catch(() => null),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchApi('/customers', {}, getToken),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchApi('/products', {}, getToken),
  });

  const mutation = useMutation({
    mutationFn: (data: InvoiceFormValues) =>
      fetchApi('/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: '',
      items: [{ productId: '', quantity: 1 }],
      dueDate: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchCustomerId = watch('customerId');

  // Real-time calculation on the frontend
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const customer = customers?.find((c: any) => c.id === watchCustomerId);
    const isInterState = userProfile && customer && userProfile.businessState !== customer.billingState;

    watchItems.forEach((item) => {
      const product = products?.find((p: any) => p.id === item.productId);
      if (product && item.quantity > 0) {
        const taxableValue = product.unitPrice * item.quantity;
        subtotal += taxableValue;

        if (isInterState) {
          totalIGST += (taxableValue * product.gstRate) / 100;
        } else {
          totalCGST += (taxableValue * (product.gstRate / 2)) / 100;
          totalSGST += (taxableValue * (product.gstRate / 2)) / 100;
        }
      }
    });

    return {
      subtotal,
      totalCGST,
      totalSGST,
      totalIGST,
      grandTotal: subtotal + totalCGST + totalSGST + totalIGST,
      isInterState,
    };
  }, [watchItems, watchCustomerId, customers, products, userProfile]);

  const onSubmit = (data: InvoiceFormValues) => {
    // Add date formatting if due date is provided
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/dashboard/invoices" className="mr-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-[#131316] shadow-sm border border-white/5 rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Customer</label>
                <select
                  {...register('customerId')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-[#0B0B0C] text-white"
                >
                  <option value="">Select a customer...</option>
                  {customers?.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.gstin ? `(${customer.gstin})` : ''}
                    </option>
                  ))}
                </select>
                {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
                
                {watchCustomerId && (
                  <div className="mt-2 text-sm font-medium">
                    {totals.isInterState ? (
                      <span className="text-blue-400 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Inter-state Transaction (IGST will apply)
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                        Intra-state Transaction (CGST + SGST will apply)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-[#0B0B0C] text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Line Items</h3>
            
            <div className="space-y-4">
              {fields.map((field, index) => {
                const selectedProductId = watchItems[index]?.productId;
                const product = products?.find((p: any) => p.id === selectedProductId);
                const quantity = watchItems[index]?.quantity || 0;
                
                let lineTotal = 0;
                let taxStr = '';
                
                if (product) {
                  const taxable = product.unitPrice * quantity;
                  if (totals.isInterState) {
                    const igst = (taxable * product.gstRate) / 100;
                    lineTotal = taxable + igst;
                    taxStr = `IGST @ ${product.gstRate}% (₹${igst.toFixed(2)})`;
                  } else {
                    const cgst = (taxable * (product.gstRate / 2)) / 100;
                    lineTotal = taxable + cgst * 2;
                    taxStr = `CGST+SGST @ ${product.gstRate}% (₹${(cgst*2).toFixed(2)})`;
                  }
                }

                return (
                  <div key={field.id} className="flex flex-wrap md:flex-nowrap gap-4 items-start p-4 border border-white/5 rounded-lg bg-white/[0.02]">
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Product/Service</label>
                      <select
                        {...register(`items.${index}.productId` as const)}
                        className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-[#0B0B0C] text-white text-sm"
                      >
                        <option value="">Select item...</option>
                        {products?.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ₹{p.unitPrice}
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.productId && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.productId?.message}</p>
                      )}
                    </div>
                    
                    <div className="w-1/3 md:w-1/6">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Qty</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-[#0B0B0C] text-white text-sm"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>
                    
                    <div className="w-2/3 md:w-1/4 pt-6">
                      {product && (
                        <div className="text-sm">
                          <div className="font-medium text-white">₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-slate-400">{taxStr}</div>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-auto pt-6 text-right md:text-left">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => append({ productId: '', quantity: 1 })}
              className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-400 bg-purple-500/10 rounded hover:bg-purple-500/20 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Line Item
            </button>
          </div>

          <div className="bg-[#0B0B0C] p-6 border-t border-white/5">
            <div className="w-full md:w-1/2 ml-auto space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal (Taxable Value)</span>
                <span className="font-medium text-white">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {totals.isInterState ? (
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Total IGST</span>
                  <span className="font-medium text-white">₹{totals.totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Total CGST</span>
                    <span className="font-medium text-white">₹{totals.totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Total SGST</span>
                    <span className="font-medium text-white">₹{totals.totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/5">
                <span>Grand Total</span>
                <span>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-12">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending || !watchCustomerId || fields.length === 0}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-70 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
          >
            {(isSubmitting || mutation.isPending) && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
