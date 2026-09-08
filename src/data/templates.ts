import { ComponentTemplate } from '@/lib/types';

export const TEMPLATES: ComponentTemplate[] = [
  {
    id: 'analytics-dashboard',
    title: 'SaaS Analytics Dashboard',
    category: 'Dashboard',
    badge: 'Popular',
    description: 'High-density metrics overview with dynamic period toggling, trend sparklines, and interactive transactions table.',
    prompt: 'Create a modern SaaS analytics dashboard with metrics cards, revenue trend charts, and a filterable transactions table.',
    code: `import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, CreditCard, 
  Activity, ArrowUpRight, Search, Filter, Download, Calendar, 
  ChevronRight, MoreVertical, ShieldAlert, CheckCircle2 
} from 'lucide-react';

export default function App() {
  const [timeRange, setTimeRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = [
    { title: 'Total Revenue', value: '$128,430.00', change: '+14.2%', isPositive: true, icon: DollarSign, period: 'vs last month' },
    { title: 'Active Subscriptions', value: '3,842', change: '+8.1%', isPositive: true, icon: Users, period: 'vs last month' },
    { title: 'Avg. Churn Rate', value: '1.42%', change: '-0.3%', isPositive: true, icon: Activity, period: 'vs last month' },
    { title: 'Failed Payments', value: '$1,290.00', change: '+2.4%', isPositive: false, icon: CreditCard, period: 'requires review' },
  ];

  const transactions = [
    { id: 'TX-9021', customer: 'Acme Corp', plan: 'Enterprise Annual', amount: '$12,000.00', status: 'Completed', date: 'Just now' },
    { id: 'TX-9020', customer: 'Sarah Jenkins', plan: 'Pro Monthly', amount: '$49.00', status: 'Completed', date: '12m ago' },
    { id: 'TX-9019', customer: 'Linear Labs', plan: 'Growth Tier', amount: '$299.00', status: 'Pending', date: '45m ago' },
    { id: 'TX-9018', customer: 'David Kim', plan: 'Pro Monthly', amount: '$49.00', status: 'Failed', date: '2h ago' },
    { id: 'TX-9017', customer: 'HyperScale Inc', plan: 'Enterprise Custom', amount: '$24,500.00', status: 'Completed', date: '5h ago' },
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) || tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Revenue & Growth Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Sync
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">Real-time metrics, MRR velocity, and enterprise payment streams.</p>
        </div>

        {/* Time Filter & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex items-center gap-1 text-xs">
            {['7d', '30d', '90d', '12m'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={\`px-3 py-1.5 rounded-md font-medium transition \${timeRange === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}\`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-medium text-zinc-200 transition">
            <Download className="w-4 h-4 text-zinc-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition">
              <div className="flex items-center justify-between text-zinc-400 mb-3">
                <span className="text-xs font-medium uppercase tracking-wider">{stat.title}</span>
                <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-300">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className={\`inline-flex items-center font-medium \${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'}\`}>
                  {stat.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                  {stat.change}
                </span>
                <span className="text-zinc-500">{stat.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">MRR Velocity & Inflow</h2>
              <p className="text-xs text-zinc-400">Monthly recurring revenue projection over time</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
              Avg +18.4% MoM
            </span>
          </div>

          {/* SVG Sparkline visualization */}
          <div className="h-56 w-full flex items-end gap-3 pt-6 px-2">
            {[42, 58, 51, 65, 74, 69, 85, 92, 88, 102, 115, 128].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  style={{ height: \`\${(val / 130) * 100}%\` }} 
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600/60 to-indigo-500 group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-300 relative"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] text-white px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                    $\${val}k
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">M{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Plan Distribution</h2>
            <p className="text-xs text-zinc-400 mb-6">Active customer accounts categorized by subscription tier.</p>

            <div className="space-y-4">
              {[
                { name: 'Enterprise Custom', share: '62%', color: 'bg-indigo-500', count: '1,420 seats' },
                { name: 'Growth Tier', share: '24%', color: 'bg-violet-500', count: '980 seats' },
                { name: 'Pro Monthly', share: '14%', color: 'bg-sky-500', count: '1,442 seats' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{item.name}</span>
                    <span className="text-zinc-400 font-mono">{item.share}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className={\`h-full rounded-full \${item.color}\`} style={{ width: item.share }} />
                  </div>
                  <div className="text-[11px] text-zinc-500 text-right">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 mt-6 flex items-center justify-between text-xs text-zinc-400">
            <span>Net Expansion Rate</span>
            <span className="text-emerald-400 font-semibold font-mono">116.4%</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-zinc-400">Filtered real-time settlement log</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search customer or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-800/80 border border-zinc-700/60 rounded-lg text-xs text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800/60">
              <tr>
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/30 transition">
                  <td className="px-5 py-3.5 font-mono text-zinc-400">{tx.id}</td>
                  <td className="px-5 py-3.5 font-medium text-white">{tx.customer}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{tx.plan}</td>
                  <td className="px-5 py-3.5 font-mono font-medium text-white">{tx.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={\`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium \${
                      tx.status === 'Completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : tx.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }\`}>
                      <span className={\`w-1.5 h-1.5 rounded-full \${
                        tx.status === 'Completed' ? 'bg-emerald-400' : tx.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-400'
                      }\`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-zinc-500 font-mono">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
  },
  {
    id: 'pricing-matrix',
    title: 'Modern SaaS Pricing Matrix',
    category: 'Landing',
    badge: 'High Conversion',
    description: 'Tiered pricing with billing switch (-20% discount), feature comparison, tooltips, and interactive FAQ.',
    prompt: 'Build a modern SaaS pricing page with an annual/monthly toggle, highlighted Pro tier, and FAQ accordion.',
    code: `import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight, Zap, Shield, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [billingCycle, setBillingCycle] = useState('annual');
  const [openFaq, setOpenFaq] = useState(null);

  const handleSelectPlan = (tier) => {
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.6 }
    });
  };

  const tiers = [
    {
      name: 'Starter',
      description: 'Ideal for indie hackers, prototyping, and solo builders.',
      monthlyPrice: 19,
      annualPrice: 15,
      popular: false,
      features: [
        'Up to 5 active sandbox projects',
        '10,000 AI generation tokens/mo',
        'Community Discord access',
        'Standard generation speed',
        'Export to Next.js & Vite'
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Pro',
      description: 'For growing development teams and professional software engineers.',
      monthlyPrice: 49,
      annualPrice: 39,
      popular: true,
      features: [
        'Unlimited interactive sandboxes',
        '100,000 AI generation tokens/mo',
        'BYOK (Bring Your Own Key) unlimited',
        'Priority Ultra-fast streaming',
        'Custom domain hosting & export',
        'Version history rollback',
        'Direct email support (< 2hr)'
      ],
      cta: 'Upgrade to Pro',
    },
    {
      name: 'Enterprise',
      description: 'Custom governance, private sandboxes, and dedicated model fine-tuning.',
      monthlyPrice: 199,
      annualPrice: 169,
      popular: false,
      features: [
        'Everything in Pro included',
        'SSO, SAML & audit logging',
        'Private VPC or on-prem deployment',
        'Custom design system training',
        '99.99% uptime SLA guarantee',
        'Dedicated Solutions Architect',
      ],
      cta: 'Contact Sales',
    }
  ];

  const faqs = [
    {
      q: 'Can I cancel or switch billing cycles anytime?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly in your account dashboard. Annual plans will be prorated automatically.'
    },
    {
      q: 'How does Bring Your Own Key (BYOK) work?',
      a: 'If you have an existing Gemini or OpenAI API key, you can connect it directly in Forma AI. Your requests will use your personal quota with 0% markup and zero token limits.'
    },
    {
      q: 'Do I own the generated code?',
      a: '100%. All React components, Tailwind styling, and logic generated in Forma AI are completely yours under the MIT license for commercial or personal use.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Build Better Interfaces, <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">10x Faster</span>
          </h1>

          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Get started for free or scale your workflow with priority streaming, unlimited iterations, and team collaboration.
          </p>

          {/* Billing Switch */}
          <div className="pt-6 flex items-center justify-center gap-4">
            <span className={\`text-sm font-medium \${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-500'}\`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 rounded-full bg-zinc-800 p-1 transition relative border border-zinc-700"
            >
              <div className={\`w-5 h-5 rounded-full bg-indigo-500 transition-transform \${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}\`} />
            </button>
            <span className={\`text-sm font-medium flex items-center gap-1.5 \${billingCycle === 'annual' ? 'text-white' : 'text-zinc-500'}\`}>
              Annual
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {tiers.map((tier) => {
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.name}
                className={\`relative rounded-2xl p-8 flex flex-col justify-between transition duration-300 \${
                  tier.popular
                    ? 'bg-zinc-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'
                }\`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-md flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 min-h-[32px]">{tier.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white font-mono">\${price}</span>
                    <span className="text-xs text-zinc-400">/ user / mo</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-[11px] text-zinc-500 mt-1 font-mono">Billed annually (\${price * 12}/yr)</div>
                  )}

                  <div className="w-full h-px bg-zinc-800 my-6" />

                  <ul className="space-y-3 text-xs text-zinc-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPlan(tier.name)}
                    className={\`w-full py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 \${
                      tier.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }\`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto border-t border-zinc-800 pt-12">
          <h2 className="text-2xl font-bold text-center text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm font-medium text-zinc-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  },
  {
    id: 'kanban-board',
    title: 'Agile Kanban Project Board',
    category: 'Productivity',
    badge: 'Interactive',
    description: 'Sprint management with multi-column task flow, priority tagging, new task creation, and team avatars.',
    prompt: 'Build an interactive Kanban board with columns (Backlog, In Progress, In Review, Done), task priority pills, and task adding.',
    code: `import React, { useState } from 'react';
import { Plus, MoreHorizontal, Clock, Tag, User, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Implement Gemini 1.5 streaming parser', column: 'in_progress', priority: 'High', assignee: 'Alex R.', points: 5 },
    { id: '2', title: 'Design mobile responsive frame mockups', column: 'done', priority: 'Medium', assignee: 'Elena M.', points: 3 },
    { id: '3', title: 'Add Sandpack error boundary auto-recovery', column: 'in_progress', priority: 'High', assignee: 'Roshan D.', points: 8 },
    { id: '4', title: 'Benchmark token usage & TTFT latency', column: 'backlog', priority: 'Low', assignee: 'David K.', points: 2 },
    { id: '5', title: 'Integrate canvas confetti celebration hook', column: 'review', priority: 'Medium', assignee: 'Sarah T.', points: 3 },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState('backlog');
  const [isAdding, setIsAdding] = useState(false);

  const columns = [
    { id: 'backlog', label: 'Backlog', color: 'bg-zinc-500' },
    { id: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
    { id: 'review', label: 'In Review', color: 'bg-indigo-500' },
    { id: 'done', label: 'Completed', color: 'bg-emerald-500' },
  ];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      column: newTaskColumn,
      priority: 'Medium',
      assignee: 'You',
      points: 3,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const moveTask = (taskId, direction) => {
    const colOrder = ['backlog', 'in_progress', 'review', 'done'];
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const currentIndex = colOrder.indexOf(task.column);
        const nextIndex = direction === 'next' ? Math.min(currentIndex + 1, colOrder.length - 1) : Math.max(currentIndex - 1, 0);
        if (colOrder[nextIndex] === 'done' && task.column !== 'done') {
          confetti({ particleCount: 50, spread: 60 });
        }
        return { ...task, column: colOrder[nextIndex] };
      }
      return task;
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Engineering Sprint Board</h1>
          <p className="text-xs text-zinc-400 mt-1">Sprint 42: Forma AI Studio Core Architecture & Experience</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTask} className="mt-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700/80 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <select
            value={newTaskColumn}
            onChange={(e) => setNewTaskColumn(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Completed</option>
          </select>
          <div className="flex items-center gap-2">
            <button type="submit" className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white">
              Add Task
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.column === col.id);
          return (
            <div key={col.id} className="rounded-xl bg-zinc-900/40 border border-zinc-800/80 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={\`w-2 h-2 rounded-full \${col.color}\`} />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{col.label}</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={\`text-[10px] font-semibold px-2 py-0.5 rounded-full \${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }\`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{task.points} pts</span>
                    </div>

                    <p className="text-xs font-medium text-white leading-snug">{task.title}</p>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300">
                          {task.assignee.charAt(0)}
                        </div>
                        <span>{task.assignee}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {col.id !== 'backlog' && (
                          <button
                            onClick={() => moveTask(task.id, 'prev')}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, 'next')}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`,
  },
  {
    id: 'ecommerce-product',
    title: 'E-Commerce Showcase Card',
    category: 'E-Commerce',
    badge: 'High Polish',
    description: 'Product detail view with multi-image gallery thumbnail switcher, color selection, quantity stepper, and confetti checkout.',
    prompt: 'Design an interactive e-commerce product card with photo gallery thumbnails, color picker, size selector, and cart animation.',
    code: `import React, { useState } from 'react';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [selectedColor, setSelectedColor] = useState('Midnight');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  ];

  const colors = [
    { name: 'Midnight', class: 'bg-zinc-900 border-zinc-700' },
    { name: 'Titanium', class: 'bg-zinc-400 border-zinc-500' },
    { name: 'Nordic Indigo', class: 'bg-indigo-600 border-indigo-500' },
  ];

  const sizes = ['S', 'M', 'L', 'XL'];

  const handleAddToCart = () => {
    setCartCount(prev => prev + quantity);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.75 }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-4xl w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Top Navbar */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400">AudioCraft Studio Series</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={\`p-2 rounded-full border border-zinc-800 transition \${isLiked ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-zinc-400 hover:text-white'}\`}
            >
              <Heart className={\`w-4 h-4 \${isLiked ? 'fill-current' : ''}\`} />
            </button>
            <div className="relative">
              <div className="p-2 rounded-full border border-zinc-800 text-zinc-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Gallery View */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/60 relative group">
              <img
                src={images[activeImage]}
                alt="Product"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-white border border-white/10">
                Studio Edition
              </span>
            </div>

            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={\`w-20 h-20 rounded-xl overflow-hidden border-2 transition \${
                    activeImage === i ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }\`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Configurator */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-zinc-300">4.92</span>
                <span className="text-xs text-zinc-500">(1,248 reviews)</span>
              </div>

              <h1 className="text-3xl font-extrabold text-white tracking-tight">SonicWave Pro ANC Headphones</h1>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Spatial audio acoustic chamber, 45-hour ultra battery life, and planar magnetic precision transducers.
              </p>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white font-mono">$349.00</span>
                <span className="text-sm text-zinc-500 line-through font-mono">$429.00</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Save 18%
                </span>
              </div>
            </div>

            {/* Color Select */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                Colorway: <span className="text-white">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={\`w-8 h-8 rounded-full border-2 transition-all \${c.class} \${
                      selectedColor === c.name ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900 scale-110' : 'opacity-80'
                    }\`}
                  />
                ))}
              </div>
            </div>

            {/* Size Select */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                Ear Cushion Size
              </label>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={\`w-10 h-10 rounded-xl text-xs font-semibold border transition \${
                      selectedSize === s
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }\`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & CTA */}
            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono text-xs font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart • \${(349 * quantity).toLocaleString()}</span>
              </button>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-800 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Free 2-Day Air</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>2-Yr Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  },
  {
    id: 'team-roles',
    title: 'Team & Permissions Matrix',
    category: 'Dashboard',
    badge: 'Enterprise',
    description: 'Member access control directory with search, role dropdowns, active status tags, and invitation modal.',
    prompt: 'Create a team management and permissions interface with member search, role change dropdowns, and invite modal.',
    code: `import React, { useState } from 'react';
import { Users, UserPlus, Search, Shield, MoreVertical, Check, Mail, Filter } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState([
    { id: '1', name: 'Sophia Chen', email: 'sophia@cloudsync.dev', role: 'Owner', status: 'Active', department: 'Engineering' },
    { id: '2', name: 'Marcus Vance', email: 'marcus@cloudsync.dev', role: 'Admin', status: 'Active', department: 'Product' },
    { id: '3', name: 'Amira Patel', email: 'amira@cloudsync.dev', role: 'Editor', status: 'On Leave', department: 'Design' },
    { id: '4', name: 'Liam O’Connor', email: 'liam@cloudsync.dev', role: 'Viewer', status: 'Active', department: 'Growth' },
    { id: '5', name: 'Zoe Becker', email: 'zoe@cloudsync.dev', role: 'Editor', status: 'Invited', department: 'Engineering' },
  ]);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleRoleChange = (memberId, newRole) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'Viewer',
      status: 'Invited',
      department: 'General',
    };
    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'All' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Organization Members</h1>
            <p className="text-xs text-zinc-400 mt-1">Manage workspace seats, permissions, and security roles.</p>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-400">Role:</span>
            {['All', 'Admin', 'Editor', 'Viewer'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={\`px-3 py-1 rounded-md text-xs font-medium transition \${
                  filterRole === r ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }\`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Member Table */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{m.name}</div>
                          <div className="text-zinc-500 text-[11px]">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-300">{m.department}</td>
                    <td className="px-5 py-4">
                      <span className={\`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium \${
                        m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        m.status === 'On Leave' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      }\`}>
                        <span className={\`w-1.5 h-1.5 rounded-full \${
                          m.status === 'Active' ? 'bg-emerald-400' : m.status === 'On Leave' ? 'bg-amber-400' : 'bg-zinc-500'
                        }\`} />
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {m.role === 'Owner' ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Owner
                        </span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          className="bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-200 px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-zinc-500 hover:text-white p-1 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Modal */}
        {isInviteOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSendInvite} className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Invite New Teammate</h3>
              <p className="text-xs text-zinc-400">They will receive an invitation link with default viewer permissions.</p>

              <div>
                <label className="text-xs text-zinc-300 font-medium mb-1 block">Work Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
`,
  },
  {
    id: 'voice-media-studio',
    title: 'AI Voice & Speech Synthesizer',
    category: 'Media',
    badge: 'Generative AI',
    description: 'Audio generation interface with voice selector, pitch/speed sliders, and simulated waveform player.',
    prompt: 'Create an AI voice synthesis studio with voice character selectors, playback visualizer, and script text editor.',
    code: `import React, { useState } from 'react';
import { Mic, Play, Pause, Volume2, Sparkles, Sliders, RefreshCw, Wand2, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Alloy');
  const [speed, setSpeed] = useState(1.0);
  const [stability, setStability] = useState(75);
  const [scriptText, setScriptText] = useState(
    "Welcome to the next generation of voice synthesis. Forma AI delivers natural vocal nuance, studio acoustics, and millisecond latency."
  );

  const voices = [
    { id: 'Alloy', desc: 'Warm, conversational & approachable' },
    { id: 'Nova', desc: 'Dynamic, energized & presenter style' },
    { id: 'Onyx', desc: 'Deep, resonant & authoritative narration' },
    { id: 'Echo', desc: 'Clear, studio podcast tone' },
  ];

  const handleGenerateAudio = () => {
    setIsPlaying(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">SonicAI Voice Synthesis Studio</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.4 Ultra
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Multi-character generative neural speech synthesis.</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export WAV
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Script Input & Player */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold uppercase tracking-wider">Voice Script Editor</span>
                <span>{scriptText.length} chars</span>
              </div>

              <textarea
                rows={5}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setScriptText("Forma AI is an intelligent prompt-to-UI studio that turns high-level specs into production-grade React components.")}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" /> Insert Example Prompt
                </button>

                <button
                  onClick={handleGenerateAudio}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Synthesize Audio
                </button>
              </div>
            </div>

            {/* Audio Waveform Visualizer Simulation */}
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <div className="text-xs font-semibold text-white">{selectedVoice} Model • 48kHz Stereo</div>
                    <div className="text-[10px] text-zinc-400 font-mono">00:04 / 00:18</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-400">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-xs font-mono">100%</span>
                </div>
              </div>

              {/* Waveform Bars */}
              <div className="h-16 flex items-center gap-1 px-2 bg-zinc-950 rounded-lg border border-zinc-800/80">
                {[18, 35, 55, 80, 45, 20, 65, 95, 75, 50, 30, 85, 90, 60, 40, 25, 70, 80, 50, 35, 20, 40, 60, 75, 45, 30, 15].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: \`\${isPlaying ? Math.min(100, h * (0.8 + Math.random() * 0.4)) : h}%\` }}
                    className={\`flex-1 rounded-full transition-all duration-150 \${
                      i < 9 ? 'bg-indigo-500' : 'bg-zinc-700'
                    }\`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Model & Voice Configuration */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select Voice Model</h2>

              <div className="space-y-2">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={\`w-full text-left p-3 rounded-xl border transition \${
                      selectedVoice === v.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                    }\`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{v.id}</span>
                      {selectedVoice === v.id && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{v.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                    <span>Speed ({speed}x)</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                    <span>Style Stability ({stability}%)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={stability}
                    onChange={(e) => setStability(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  },
];
