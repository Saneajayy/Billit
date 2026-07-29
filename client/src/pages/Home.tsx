import { Link } from 'react-router-dom';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ArrowRight, Bot, FileText, LayoutDashboard, Shield, Lock, CheckCircle2, Star, Server, Database, Users, Package } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-slate-200 font-sans selection:bg-purple-500/30 relative overflow-hidden">
      
      {/* Subtle Background Elements to make it feel premium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent blur-3xl rounded-full"></div>
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.05] bg-[#0B0B0C]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Billit</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>
          
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 relative z-10">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-xs font-medium mb-8 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5" />
            100% Compliant with Indian GST Guidelines
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
            Enterprise-grade GST billing, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">simplified.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl font-light leading-relaxed">
            Stop worrying about manual tax calculations and formatting. Billit securely automates your invoicing workflow with bank-level encryption.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors w-full sm:w-auto">
                  Start Invoicing Securely <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link 
                to="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors w-full sm:w-auto"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
          </div>

          <div className="flex items-center justify-center gap-8 text-slate-500 text-sm font-medium border-t border-white/5 pt-8 w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              256-bit Encryption
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              99.9% Uptime
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              Daily Backups
            </div>
          </div>
        </section>

        {/* Dashboard Preview Mockup to build trust */}
        <section className="max-w-5xl mx-auto px-6 mb-32">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#131316] shadow-2xl p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent z-10 top-1/2"></div>
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-[#0B0B0C]">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="aspect-[16/9] bg-[#1A1A1E] relative overflow-hidden rounded-b-lg text-left">
              {/* Fake UI */}
              <div className="flex h-full">
                {/* Sidebar Mock */}
                <div className="w-48 border-r border-white/5 p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold">B</div>
                    <span className="text-white font-bold text-sm tracking-tight">Billit</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/50">
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-purple-500/40 text-slate-400 text-xs font-medium">
                    <FileText className="w-3.5 h-3.5" /> Invoices
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-purple-500/40 text-slate-400 text-xs font-medium">
                    <Users className="w-3.5 h-3.5" /> Customers
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-purple-500/40 text-slate-400 text-xs font-medium">
                    <Package className="w-3.5 h-3.5" /> Products
                  </div>
                </div>
                {/* Main Content Mock */}
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white">Dashboard Overview</h3>
                    <div className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-medium flex items-center gap-1.5">
                      + Create Invoice
                    </div>
                  </div>
                  
                  {/* KPI Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div className="text-slate-400 text-xs font-medium mb-1">Total Revenue (YTD)</div>
                      <div className="text-2xl font-bold text-white mb-2">₹1,24,500.00</div>
                      <div className="text-emerald-400 text-[10px] font-medium">+14.5% from last month</div>
                    </div>
                    <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div className="text-slate-400 text-xs font-medium mb-1">Total CGST Collected</div>
                      <div className="text-2xl font-bold text-white mb-2">₹11,205.00</div>
                      <div className="text-slate-500 text-[10px] font-medium">Filed automatically</div>
                    </div>
                    <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div className="text-slate-400 text-xs font-medium mb-1">Total SGST Collected</div>
                      <div className="text-2xl font-bold text-white mb-2">₹11,205.00</div>
                      <div className="text-slate-500 text-[10px] font-medium">Filed automatically</div>
                    </div>
                  </div>

                  {/* Recent Invoices Mock Table */}
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 bg-[#131316]">
                      <span className="text-sm font-semibold text-white">Recent Invoices</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { id: 'INV-2026-0089', customer: 'Acme Corp', amt: '₹45,000.00', status: 'PAID' },
                        { id: 'INV-2026-0088', customer: 'DesignStudio', amt: '₹12,400.00', status: 'ISSUED' },
                        { id: 'INV-2026-0087', customer: 'Global Tech', amt: '₹8,950.00', status: 'DRAFT' }
                      ].map((inv, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="font-medium text-slate-300 w-24">{inv.id}</div>
                          <div className="text-slate-400 flex-1">{inv.customer}</div>
                          <div className="font-medium text-white w-24 text-right">{inv.amt}</div>
                          <div className="w-20 flex justify-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              inv.status === 'ISSUED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}>{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust Section */}
        <section id="security" className="max-w-7xl mx-auto px-6 mb-32">
          <div className="bg-[#131316] border border-white/5 rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Your financial data is locked down.</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  We treat your business data with the highest level of security. Billit is built on modern infrastructure that ensures your invoices and customer details are always protected and never shared.
                </p>
                <ul className="space-y-5">
                  {[
                    { title: "SOC2 Compliant Authentication", desc: "Powered by Clerk, ensuring secure access." },
                    { title: "End-to-End Database Encryption", desc: "Your data is encrypted at rest and in transit." },
                    { title: "No Lock-in", desc: "Export all your invoices to PDF or CSV at any time." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">{item.title}</div>
                        <div className="text-sm text-slate-400">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent blur-2xl rounded-full"></div>
                <div className="relative h-full">
                  <div className="p-6 rounded-2xl border border-purple-500/40 bg-[#0B0B0C] h-full flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">System Security Status</span>
                      </div>
                      <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        Protected
                      </div>
                    </div>
                    <div className="space-y-4 flex-1">
                      {[
                        { label: 'Database Encryption', value: 'AES-256-GCM', status: 'Active' },
                        { label: 'Network Security', value: 'Strict TLS v1.3', status: 'Active' },
                        { label: 'Authentication', value: 'Clerk Vault', status: 'Verified' },
                        { label: 'Automated Backups', value: 'Multi-region', status: 'Enabled' }
                      ].map((stat, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div>
                            <div className="text-slate-300 font-medium">{stat.label}</div>
                            <div className="text-xs text-slate-500">{stat.value}</div>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-xs font-medium">{stat.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful, yet invisible.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to run your billing, meticulously designed to stay out of your way.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="w-5 h-5 text-purple-400" />,
                title: "Automated PDF Generation",
                description: "Our background workers generate pixel-perfect, tax-compliant PDF invoices in milliseconds."
              },
              {
                icon: <LayoutDashboard className="w-5 h-5 text-purple-400" />,
                title: "Smart GST Routing",
                description: "Inter-state vs Intra-state? Billit automatically applies CGST/SGST or IGST based on billing addresses."
              },
              {
                icon: <Bot className="w-5 h-5 text-purple-400" />,
                title: "Gemini AI Integration",
                description: "Chat with your financial data. Instantly pull revenue reports without exporting to Excel."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-purple-500/40 bg-[#131316] hover:bg-[#1A1A1E] transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-[#0B0B0C] flex items-center justify-center mb-6 border border-purple-500/40">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust / Testimonials */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by Indian Professionals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Moving to Billit was the best decision for our firm. The interface is clean, professional, and our accountants love the accuracy of the automated GST calculations.",
                author: "Vikram Mehta",
                role: "Director, Mehta & Associates",
                rating: 5
              },
              {
                quote: "Unlike other clunky ERPs, Billit feels like modern software. Generating invoices takes seconds. It is completely stable and the PDFs look fantastic.",
                author: "Ananya Sharma",
                role: "Founder, DesignStudio",
                rating: 5
              },
              {
                quote: "The AI assistant is phenomenal. Being able to ask 'How much GST did we collect last month?' and getting an instant answer saves me hours of manual tallying.",
                author: "Rajiv Kapoor",
                role: "Operations Manager",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-2xl border border-purple-500/40 bg-[#131316] flex flex-col">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-8 flex-1 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{testimonial.author}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0B0B0C] relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-white/5 pb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Billit</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Enterprise-grade GST billing software for modern Indian businesses. Built for speed, security, and simplicity.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-purple-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} Billit Software. All rights reserved.</p>
            <p>Made with precision for India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
