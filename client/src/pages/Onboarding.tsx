import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { Loader2 } from 'lucide-react';

const onboardingSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessGSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  businessState: z.string().length(2, 'State code must be 2 digits'),
  businessAddress: z.string().min(1, 'Address is required'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: OnboardingFormValues) =>
      fetchApi('/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      }, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      navigate('/');
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: '',
      businessGSTIN: '',
      businessState: '',
      businessAddress: '',
    }
  });

  const onSubmit = (data: OnboardingFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-purple-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Welcome to Billit
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Let's set up your business profile to start generating GST invoices.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#131316] py-8 px-4 shadow-xl shadow-purple-500/5 sm:rounded-2xl sm:px-10 border border-white/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300">Business Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('businessName')}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-[#0B0B0C] text-white"
                  placeholder="Acme Technologies Pvt Ltd"
                />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Business GSTIN</label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('businessGSTIN')}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setValue('businessGSTIN', val);
                    if (val.length >= 2) {
                      const stateCode = val.substring(0, 2);
                      if (!isNaN(Number(stateCode))) {
                        setValue('businessState', stateCode);
                      }
                    }
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 uppercase font-mono bg-[#0B0B0C] text-white"
                  placeholder="29ABCDE1234F1Z5"
                />
                {errors.businessGSTIN && <p className="text-red-500 text-xs mt-1">{errors.businessGSTIN.message}</p>}
                <p className="text-xs text-slate-400 mt-2">Your 15-digit GST identification number.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Home State Code (e.g. 29 for Karnataka)</label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('businessState')}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-[#0B0B0C] text-white"
                  maxLength={2}
                />
                {errors.businessState && <p className="text-red-500 text-xs mt-1">{errors.businessState.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Business Address</label>
              <div className="mt-1">
                <textarea
                  {...register('businessAddress')}
                  rows={3}
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-[#0B0B0C] text-white"
                />
                {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress.message}</p>}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <UserButton afterSignOutUrl="/sign-in" />
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="inline-flex items-center justify-center py-2 px-6 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {(isSubmitting || mutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Complete Setup
              </button>
            </div>
            
            {mutation.isError && (
              <div className="text-red-400 text-sm mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                {mutation.error.message || 'An error occurred during onboarding.'}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
