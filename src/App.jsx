import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, CreditCard, BarChart3, 
  Plus, Search, Bell, TrendingUp, TrendingDown, Wallet, 
  AlertCircle, X, Save, CheckCircle2, Printer, Filter,
  PieChart, Settings, Trash2, Download, ChevronDown, Upload
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

const initialClients = [
  { id: 'C-0001', name: 'PT PIXEL KOMUNITAS', group: 'PIXEL Group', tier: '1', pic: 'Afin', contractValue: 15000000, sifat: 'Rutin' },
  { id: 'C-0002', name: 'PT PIXEL ART INDONESIA', group: 'PIXEL Group', tier: '1', pic: 'Afin', contractValue: 10000000, sifat: 'Rutin' },
  { id: 'C-0003', name: 'PT IDEAL MEDIA SOLUTION', group: 'PIXEL Group', tier: '2', pic: 'Nadhief', contractValue: 8000000, sifat: 'Insidental' },
  { id: 'C-0006', name: 'PT KAHAPTEX TEXTILE', group: 'None', tier: '2', pic: 'Ardy', contractValue: 20000000, sifat: 'Rutin' },
];

const initialPics = ['Afin', 'Nadhief', 'Ardy'];

const initialInvoices = [
  { id: 'INV-156/MARC/CONT/I/2026', date: '2026-01-02', client: 'PT PIXEL KOMUNITAS', amount: 30000000, status: 'Lunas', paymentDate: '2026-01-24', desc: 'Retainer Januari' },
  { id: 'INV-157/MARC/CONT/I/2026', date: '2026-01-02', client: 'PT PIXEL ART INDONESIA', amount: 10000000, status: 'Lunas', paymentDate: '2026-02-08', desc: 'Retainer Januari' },
  { id: 'INV-115/MARC/CONT/V/2026', date: '2026-05-29', client: 'PT BUMEN REDJA ABADI', amount: 15000000, status: 'Belum Lunas', paymentDate: '-', desc: 'Project Video Profil' },
  { id: 'INV-112/MARC/CONT/V/2026', date: '2026-05-29', client: 'PT PALEM TRIKARYA INDONESIA', amount: 5000000, status: 'Belum Lunas', paymentDate: '-', desc: 'Social Media Management' },
];

const initialExpenses = [
  { id: 1, date: '2026-01-25', category: 'Biaya Gaji Rutin', description: 'Gaji Afin', amount: 7770084 },
  { id: 2, date: '2026-01-25', category: 'Biaya Gaji Rutin', description: 'Gaji Gita', amount: 9000000 },
  { id: 3, date: '2026-06-05', category: 'Biaya Operasional', description: 'Listrik Kantor', amount: 1500000 },
];

const initialCategories = ['Biaya Operasional', 'Biaya Gaji Rutin', 'Biaya Marketing', 'Biaya Pajak', 'Lain-lain'];

const initialMonthlyData = [
  { month: 'Januari', income: 192300000, expense: 133875462, initialBalance: 361719073 },
  { month: 'Februari', income: 184760000, expense: 139952036, initialBalance: 436198611 },
  { month: 'Maret', income: 60783333, expense: 182484907, initialBalance: 481061575 },
  { month: 'April', income: 249530000, expense: 157898329, initialBalance: 368360001 },
  { month: 'Mei', income: 104250000, expense: 170087964, initialBalance: 459991672 },
  { month: 'Juni', income: 106700000, expense: 149647184, initialBalance: 394153708 },
];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const getMonthName = (dateString) => {
  if(dateString === '-') return '-';
  const d = new Date(dateString);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[d.getMonth()];
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [clients, setClients] = useState(initialClients);
  const [picList, setPicList] = useState(initialPics);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [expenseCategories, setExpenseCategories] = useState(initialCategories);
  const [monthlyData, setMonthlyData] = useState(initialMonthlyData);

  // Filter States for Invoices
  const [invoiceFilter, setInvoiceFilter] = useState({ client: '', status: '', month: '', billingMonth: '', pic: '' });
  const [clientFilter, setClientFilter] = useState({ group: '', pic: '', tier: '' });
  
  // Print State
  const [printData, setPrintData] = useState(null);

  // Report States
  const [reportType, setReportType] = useState('ytd'); // 'ytd' or 'standalone'
  const currentMonth = 'Juni'; 

  const [customAccounts, setCustomAccounts] = useState({
    lrIncome: [],
    lrExpense: [],
    neracaAsset: [
      { id: 'a1', name: 'Inventaris', value: 13300000 },
      { id: 'a2', name: 'Peralatan Kantor', value: 5000000 }
    ],
    neracaLiability: [
      { id: 'l1', name: 'Hutang Pajak', value: 2521594 }
    ]
  });

  // Modal States
  const [showClientModal, setShowClientModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Form States
  const [clientForm, setClientForm] = useState({ name: '', group: 'None', tier: '3', pic: '', contractValue: '', sifat: 'Rutin' });
  const [isAddingPic, setIsAddingPic] = useState(false);
  const [newPic, setNewPic] = useState('');
  const [invoiceForm, setInvoiceForm] = useState({ client: '', amount: '', date: '', dueDate: '', desc: '' });
  const [expenseForm, setExpenseForm] = useState({ date: '', category: expenseCategories[0], description: '', amount: '' });
  const [newCategory, setNewCategory] = useState('');

  const [expenseFilter, setExpenseFilter] = useState({ month: '' });
  const [isAddingNewCatInForm, setIsAddingNewCatInForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // --- EXCEL LOGIC START ---
  useEffect(() => {
    // Memuat modul Excel (SheetJS) secara dinamis agar bisa import/export tanpa server
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const exportToExcel = (data, filename) => {
    if (!window.XLSX) {
      alert("Sistem sedang memuat modul Excel. Silakan coba dalam beberapa detik.");
      return;
    }
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    window.XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const importFromExcel = (e, type) => {
    if (!window.XLSX) {
      alert("Sistem sedang memuat modul Excel. Silakan coba dalam beberapa detik.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = window.XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = window.XLSX.utils.sheet_to_json(sheet);

        if (type === 'clients') {
          const newClients = jsonData.map((row, i) => ({
            id: row.id || `C-IMP-${Date.now().toString().slice(-4)}${i}`,
            name: row.name || row['Nama Perusahaan'] || 'Unknown',
            group: row.group || row['Grup'] || 'None',
            tier: String(row.tier || row['Tier'] || '3'),
            pic: row.pic || row['PIC'] || picList[0] || '-',
            contractValue: Number(row.contractValue || row['Nilai Kontrak/Bulan'] || row['Nilai Kontrak'] || 0),
            sifat: row.sifat || row['Sifat'] || 'Rutin'
          }));
          setClients(prev => [...prev, ...newClients]);
          
          const newPics = [...new Set(newClients.map(c => c.pic))].filter(p => !picList.includes(p));
          if (newPics.length > 0) setPicList(prev => [...prev, ...newPics]);

        } else if (type === 'invoices') {
          const newInvoices = jsonData.map((row, i) => ({
            id: row.id || row['No Invoice'] || `INV-IMP-${Date.now().toString().slice(-4)}${i}`,
            date: row.date || row['Tanggal'] || new Date().toISOString().split('T')[0],
            client: row.client || row['Klien'] || 'Unknown',
            amount: Number(row.amount || row['Nilai Tagihan'] || row['Nominal'] || 0),
            status: row.status || row['Status'] || 'Belum Lunas',
            paymentDate: row.paymentDate || row['Tgl Masuk Bank'] || row['Tgl Cair'] || '-',
            desc: row.desc || row['Deskripsi'] || ''
          }));
          setInvoices(prev => [...prev, ...newInvoices]);

        } else if (type === 'expenses') {
          const newExpenses = jsonData.map((row, i) => ({
            id: row.id || Date.now() + i,
            date: row.date || row['Tanggal'] || new Date().toISOString().split('T')[0],
            category: row.category || row['Kelompok Biaya'] || expenseCategories[0],
            description: row.description || row['Keterangan'] || '',
            amount: Number(row.amount || row['Nominal'] || 0)
          }));
          setExpenses(prev => [...prev, ...newExpenses]);
          
          const newCats = [...new Set(newExpenses.map(e => e.category))].filter(c => !expenseCategories.includes(c));
          if (newCats.length > 0) setExpenseCategories(prev => [...prev, ...newCats]);
        }
      } catch (error) {
        console.error("Error parsing Excel:", error);
        alert("Format Excel tidak sesuai atau terjadi kesalahan.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };
  // --- EXCEL LOGIC END ---

  const totalTunggakan = useMemo(() => {
    return invoices.filter(inv => inv.status === 'Belum Lunas').reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const saldoTerakhir = useMemo(() => {
    const lastMonth = monthlyData[monthlyData.length - 1];
    return lastMonth ? lastMonth.initialBalance + lastMonth.income - lastMonth.expense : 0;
  }, [monthlyData]);

  const labaRugiBulanIni = useMemo(() => {
    const lastMonth = monthlyData[monthlyData.length - 1];
    return lastMonth ? lastMonth.income - lastMonth.expense : 0;
  }, [monthlyData]);

  const labaRugiYTD = useMemo(() => {
    return monthlyData.reduce((sum, d) => sum + (d.income - d.expense), 0);
  }, [monthlyData]);

  const dashboardChartData = useMemo(() => {
    return monthlyData.map(d => ({
      month: d.month,
      Pendapatan: d.income,
      Pengeluaran: d.expense,
      Saldo: d.initialBalance + d.income - d.expense
    }));
  }, [monthlyData]);

  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000000000) return (tickItem / 1000000000).toFixed(1) + 'M'; // Milyar
    if (tickItem >= 1000000) return (tickItem / 1000000).toFixed(0) + 'Jt'; // Juta
    return tickItem;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur border border-gray-200 p-4 rounded-xl shadow-xl z-50">
          <p className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">{label} 2026</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1.5">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
              <span className="text-sm font-medium text-gray-600">{entry.name}:</span>
              <span className="text-sm font-bold text-gray-800 ml-auto">{formatRupiah(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleAddClient = () => {
    if (!clientForm.name) return;
    const newId = `C-00${clients.length + 10}`;
    
    let finalPic = clientForm.pic || picList[0];
    if (isAddingPic && newPic) {
       finalPic = newPic;
       if (!picList.includes(newPic)) setPicList([...picList, newPic]);
    }

    setClients([...clients, { id: newId, ...clientForm, pic: finalPic, contractValue: Number(clientForm.contractValue) }]);
    setShowClientModal(false);
    setClientForm({ name: '', group: 'None', tier: '3', pic: '', contractValue: '', sifat: 'Rutin' });
    setNewPic('');
    setIsAddingPic(false);
  };

  const handleAddInvoice = () => {
    if (!invoiceForm.client || !invoiceForm.amount) return;
    const newId = `INV-${Math.floor(Math.random()*900)+100}/MARC/${new Date().getFullYear()}`;
    setInvoices([{ 
      id: newId, 
      date: invoiceForm.date || new Date().toISOString().split('T')[0], 
      client: invoiceForm.client, 
      amount: Number(invoiceForm.amount), 
      status: 'Belum Lunas', 
      paymentDate: '-',
      desc: invoiceForm.desc
    }, ...invoices]);
    setShowInvoiceModal(false);
    setInvoiceForm({ client: '', amount: '', date: '', dueDate: '', desc: '' });
  };

  const handleMarkAsPaid = (id) => {
    const today = new Date().toISOString().split('T')[0];
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        // Sync ke sistem monthly (Sederhana)
        const monthName = getMonthName(today);
        setMonthlyData(prev => prev.map(m => m.month === monthName ? { ...m, income: m.income + inv.amount } : m));
        return { ...inv, status: 'Lunas', paymentDate: today };
      }
      return inv;
    }));
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) return;
    
    let finalCategory = expenseForm.category;
    if (isAddingNewCatInForm && newCatName) {
      finalCategory = newCatName;
      if (!expenseCategories.includes(newCatName)) {
        setExpenseCategories([...expenseCategories, newCatName]);
      }
    }

    const newExp = {
      id: Date.now(),
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      category: finalCategory,
      description: expenseForm.description,
      amount: Number(expenseForm.amount)
    };
    setExpenses([newExp, ...expenses]);
    const monthName = getMonthName(newExp.date);
    setMonthlyData(prev => prev.map(m => m.month === monthName ? { ...m, expense: m.expense + newExp.amount } : m));
    setShowExpenseModal(false);
    setExpenseForm({ date: '', category: expenseCategories[0] || finalCategory, description: '', amount: '' });
    setIsAddingNewCatInForm(false);
    setNewCatName('');
  };

  const handleAddCategory = () => {
    if(newCategory && !expenseCategories.includes(newCategory)) {
      setExpenseCategories([...expenseCategories, newCategory]);
      setNewCategory('');
      setShowCategoryModal(false);
      setExpenseForm(prev => ({...prev, category: newCategory}));
    }
  };

  const addCustomAccount = (section) => {
    const newAcc = { id: Date.now().toString(), name: 'Akun Baru', value: 0 };
    setCustomAccounts(prev => ({ ...prev, [section]: [...prev[section], newAcc] }));
  };

  const updateCustomAccount = (section, id, field, val) => {
    setCustomAccounts(prev => ({
      ...prev,
      [section]: prev[section].map(acc => acc.id === id ? { ...acc, [field]: field === 'value' ? Number(val) : val } : acc)
    }));
  };

  const removeCustomAccount = (section, id) => {
    setCustomAccounts(prev => ({
      ...prev,
      [section]: prev[section].filter(acc => acc.id !== id)
    }));
  };

  const triggerPrint = (inv) => {
    setPrintData(inv);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2">
         <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Eksekutif</h2>
            <p className="text-gray-500 text-sm mt-1">Ringkasan performa keuangan MARC (Year-to-Date 2026)</p>
         </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Saldo */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform"><Wallet size={100} /></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-inner"><Wallet size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Saldo Rekening</p>
              <h3 className="text-2xl font-black text-gray-800">{formatRupiah(saldoTerakhir)}</h3>
            </div>
          </div>
        </div>

        {/* Card Laba Rugi YTD */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className={`absolute -right-6 -top-6 opacity-50 group-hover:scale-110 transition-transform ${labaRugiYTD >= 0 ? 'text-green-50' : 'text-red-50'}`}>
            {labaRugiYTD >= 0 ? <TrendingUp size={100} /> : <TrendingDown size={100} />}
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className={`p-3 rounded-xl shadow-inner ${labaRugiYTD >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {labaRugiYTD >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Laba / Rugi (YTD)</p>
              <h3 className="text-2xl font-black text-gray-800">{formatRupiah(labaRugiYTD)}</h3>
            </div>
          </div>
        </div>

        {/* Card Tunggakan */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute -right-6 -top-6 text-orange-50 opacity-50 group-hover:scale-110 transition-transform"><AlertCircle size={100} /></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-inner"><AlertCircle size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tunggakan (YTD)</p>
              <h3 className="text-2xl font-black text-gray-800">{formatRupiah(totalTunggakan)}</h3>
            </div>
          </div>
        </div>

        {/* Card Jumlah Klien */}
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute -right-6 -top-6 text-purple-50 opacity-50 group-hover:scale-110 transition-transform"><Users size={100} /></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shadow-inner"><Users size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Klien Aktif</p>
              <div className="flex items-baseline space-x-2">
                 <h3 className="text-2xl font-black text-gray-800">{clients.length}</h3>
                 <span className="text-sm font-medium text-gray-500">Perusahaan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        
        {/* Grafik Saldo Rekening (Area Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
             <h3 className="text-lg font-bold text-gray-800">Pertumbuhan Saldo Rekening</h3>
             <p className="text-xs text-gray-500 font-medium">Posisi kas bersih di akhir bulan</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldo)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Pendapatan vs Pengeluaran (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
             <h3 className="text-lg font-bold text-gray-800">Pendapatan vs Pengeluaran</h3>
             <p className="text-xs text-gray-500 font-medium">Perbandingan pergerakan dana bulanan</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Pendapatan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );

  const renderKlien = () => {
    const filteredClients = clients.filter(c => {
      let match = true;
      if (clientFilter.group && c.group !== clientFilter.group) match = false;
      if (clientFilter.pic && c.pic !== clientFilter.pic) match = false;
      if (clientFilter.tier && c.tier !== clientFilter.tier) match = false;
      return match;
    });

    const uniqueGroups = [...new Set(clients.map(c => c.group))];

    return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Filter Grup</label>
            <select value={clientFilter.group} onChange={e => setClientFilter({...clientFilter, group: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Grup</option>
              {uniqueGroups.map(g => <option key={g} value={g}>{g === 'None' ? 'Independen' : g}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Filter PIC</label>
            <select value={clientFilter.pic} onChange={e => setClientFilter({...clientFilter, pic: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua PIC</option>
              {picList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Filter Tier</label>
            <select value={clientFilter.tier} onChange={e => setClientFilter({...clientFilter, tier: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Tier</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
              <option value="4">Tier 4</option>
            </select>
          </div>
          <div>
            <button onClick={() => setClientFilter({group:'', pic:'', tier:''})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Daftar Klien</h3>
          <div className="flex space-x-2">
            <label className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center cursor-pointer transition-colors hidden sm:flex">
              <Upload size={16} className="mr-1.5" /> Import
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => importFromExcel(e, 'clients')} />
            </label>
            <button onClick={() => exportToExcel(clients, 'Data_Klien_MARC')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors hidden sm:flex">
              <Download size={16} className="mr-1.5" /> Export
            </button>
            <button onClick={() => {
              setClientForm({...clientForm, pic: picList[0] || ''});
              setIsAddingPic(false);
              setShowClientModal(true);
            }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
              <Plus size={16} className="mr-2" /> Tambah Klien
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Nama Perusahaan</th>
                <th className="p-4 font-medium">Grup</th>
                <th className="p-4 font-medium">Sifat</th>
                <th className="p-4 font-medium">Tier</th>
                <th className="p-4 font-medium">PIC</th>
                <th className="p-4 font-medium text-right">Nilai Kontrak/Bulan</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredClients.map((client, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-gray-600">{client.id}</td>
                  <td className="p-4 font-semibold text-gray-800">{client.name}</td>
                  <td className="p-4 text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${client.group === 'None' ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50 text-indigo-700'}`}>
                      {client.group !== 'None' ? client.group : 'Independen'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                     <span className={`px-2 py-1 rounded text-xs font-medium border ${client.sifat === 'Rutin' ? 'border-green-200 text-green-700 bg-green-50' : 'border-orange-200 text-orange-700 bg-orange-50'}`}>
                       {client.sifat}
                     </span>
                  </td>
                  <td className="p-4 text-gray-600">Tier {client.tier}</td>
                  <td className="p-4 text-gray-600">{client.pic}</td>
                  <td className="p-4 text-right font-medium text-green-600">{formatRupiah(client.contractValue || 0)}</td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                 <tr><td colSpan="7" className="p-8 text-center text-gray-500">Tidak ada data klien yang sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Tambah Klien Baru</h2>
              <button onClick={() => setShowClientModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
                <input type="text" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grup (Opsional)</label>
                  <input type="text" value={clientForm.group} onChange={e => setClientForm({...clientForm, group: e.target.value})} placeholder="Biarkan 'None' jika independen" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sifat Proyek</label>
                  <select value={clientForm.sifat} onChange={e => setClientForm({...clientForm, sifat: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Rutin">Rutin (Retainer)</option>
                    <option value="Insidental">Insidental (Project-based)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier Klien</label>
                  <select value={clientForm.tier} onChange={e => setClientForm({...clientForm, tier: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                    <option value="4">Tier 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Kontrak (Rp)</label>
                  <input type="number" value={clientForm.contractValue} onChange={e => setClientForm({...clientForm, contractValue: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">PIC Internal</label>
                 {!isAddingPic ? (
                    <div className="flex gap-2">
                       <select value={clientForm.pic} onChange={e => setClientForm({...clientForm, pic: e.target.value})} className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                         <option value="">-- Pilih PIC --</option>
                         {picList.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                       <button onClick={() => setIsAddingPic(true)} className="px-3 py-2 bg-gray-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                          + Baru
                       </button>
                    </div>
                 ) : (
                    <div className="flex gap-2">
                       <input type="text" value={newPic} onChange={e => setNewPic(e.target.value)} placeholder="Nama PIC baru..." className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                       <button onClick={() => {setIsAddingPic(false); setNewPic('');}} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                          Batal
                       </button>
                    </div>
                 )}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setShowClientModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleAddClient} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  const renderInvoice = () => {
    // Helper untuk mendapatkan PIC dari nama Klien
    const getPicForClient = (clientName) => {
      const client = clients.find(c => c.name === clientName);
      return client ? client.pic : '-';
    };

    // Filter Logic
    const filteredInvoices = invoices.filter(inv => {
      let match = true;
      const invoicePic = getPicForClient(inv.client);

      if (invoiceFilter.client && inv.client !== invoiceFilter.client) match = false;
      if (invoiceFilter.status && inv.status !== invoiceFilter.status) match = false;
      if (invoiceFilter.pic && invoicePic !== invoiceFilter.pic) match = false;
      
      // Bulan Penagihan (Berdasarkan Tanggal Invoice)
      if (invoiceFilter.billingMonth && !inv.date.includes(`2026-${invoiceFilter.billingMonth}`)) match = false;

      // Bulan Cair (Berdasarkan Tanggal Pembayaran)
      if (invoiceFilter.month) {
        if (inv.paymentDate === '-' && invoiceFilter.status !== 'Belum Lunas') match = false;
        if (inv.paymentDate !== '-' && !inv.paymentDate.includes(`2026-${invoiceFilter.month}`)) match = false;
      }
      return match;
    });

    const totalLunasFiltered = filteredInvoices.filter(i => i.status === 'Lunas').reduce((acc, i) => acc + i.amount, 0);

    return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Filter Klien</label>
            <select value={invoiceFilter.client} onChange={e => setInvoiceFilter({...invoiceFilter, client: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Klien</option>
              {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Filter PIC</label>
            <select value={invoiceFilter.pic} onChange={e => setInvoiceFilter({...invoiceFilter, pic: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua PIC</option>
              {picList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Bulan Tagihan</label>
            <select value={invoiceFilter.billingMonth} onChange={e => setInvoiceFilter({...invoiceFilter, billingMonth: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
            <select value={invoiceFilter.status} onChange={e => setInvoiceFilter({...invoiceFilter, status: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Bulan Cair</label>
            <select value={invoiceFilter.month} onChange={e => setInvoiceFilter({...invoiceFilter, month: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div>
            <button onClick={() => setInvoiceFilter({client:'', status:'', month:'', billingMonth: '', pic: ''})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
               Reset Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center"><Filter size={18} className="mr-2 text-blue-500"/> Daftar Invoice</h3>
          <div className="flex space-x-2">
             <label className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center cursor-pointer transition-colors hidden sm:flex">
                <Upload size={16} className="mr-1.5" /> Import
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => importFromExcel(e, 'invoices')} />
             </label>
             <button onClick={() => exportToExcel(invoices, 'Data_Invoice_MARC')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors hidden sm:flex">
                <Download size={16} className="mr-1.5" /> Export
             </button>
             <button onClick={() => setShowInvoiceModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
               <Plus size={16} className="mr-2" /> Buat Invoice
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">No Invoice</th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Klien</th>
                <th className="p-4 font-medium">PIC</th>
                <th className="p-4 font-medium text-right">Nilai Tagihan</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium">Tgl Cair</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-blue-600">{inv.id}</td>
                  <td className="p-4 text-gray-600">{inv.date}</td>
                  <td className="p-4 text-gray-800">{inv.client}</td>
                  <td className="p-4 text-gray-600">
                     <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {getPicForClient(inv.client)}
                     </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-800 text-right">{formatRupiah(inv.amount)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 inline-flex rounded-full text-xs font-semibold ${
                      inv.status === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{inv.paymentDate}</td>
                  <td className="p-4 text-right flex items-center justify-end space-x-2">
                    {inv.status === 'Belum Lunas' && (
                      <button onClick={() => handleMarkAsPaid(inv.id)} className="text-white bg-green-500 hover:bg-green-600 px-2 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center">
                        <CheckCircle2 size={14} className="mr-1"/> Lunas
                      </button>
                    )}
                    <button onClick={() => triggerPrint(inv)} className="text-gray-500 hover:text-blue-600 bg-gray-100 p-1.5 rounded-md" title="Cetak PDF">
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Tidak ada data invoice yang sesuai filter.</td></tr>
              )}
            </tbody>
            {filteredInvoices.length > 0 && (
               <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                     <td colSpan="4" className="p-4 text-right font-bold text-gray-600">Total Filtered (Lunas):</td>
                     <td className="p-4 text-right font-bold text-green-600">{formatRupiah(totalLunasFiltered)}</td>
                     <td colSpan="3"></td>
                  </tr>
               </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Invoice Modal Form */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Buat Invoice Baru</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Klien</label>
                <select value={invoiceForm.client} onChange={e => setInvoiceForm({...invoiceForm, client: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Klien --</option>
                  {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Invoice</label>
                  <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Tagihan</label>
                <textarea value={invoiceForm.desc} onChange={e => setInvoiceForm({...invoiceForm, desc: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" rows="2"></textarea>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleAddInvoice} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg flex items-center"><Save size={16} className="mr-2"/> Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )};

  const renderPengeluaran = () => {
    // 1. Data & Colors Setup
    const catColors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // 2. Chart Aggregation
    const chartData = months.map((m, idx) => {
       const monthExp = expenses.filter(e => e.date.includes(`2026-${m}`));
       const catTotals = {};
       monthExp.forEach(e => {
           catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
       });
       const total = monthExp.reduce((sum, e) => sum + e.amount, 0);
       return { month: monthNames[idx], monthNum: m, catTotals, total };
    }).filter(d => d.total > 0 || Number(d.monthNum) <= 6); // Show until June at least

    const maxChartVal = Math.max(...chartData.map(d => d.total)) || 1;

    // 3. Filter Logic
    const filteredExpenses = expenses.filter(e => {
      if (expenseFilter.month && !e.date.includes(`2026-${expenseFilter.month}`)) return false;
      return true;
    });

    const totalExpFiltered = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const filterMonthText = expenseFilter.month ? monthNames[Number(expenseFilter.month)-1] : 'Semua Bulan';
    
    return (
    <div className="animate-in fade-in duration-300 space-y-6">
      
      {/* FILTER PANEL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Pilih Bulan</label>
            <select value={expenseFilter.month} onChange={e => setExpenseFilter({...expenseFilter, month: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Bulan (2026)</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div>
            <button onClick={() => setExpenseFilter({month: ''})} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center border-l-4 border-l-red-500">
          <div className="p-4 bg-red-50 rounded-lg text-red-600 w-max mb-4"><TrendingDown size={24} /></div>
          <p className="text-sm text-gray-500 font-medium">Total Pengeluaran ({filterMonthText})</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 break-words">{formatRupiah(totalExpFiltered)}</h3>
          
          <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
             <p className="text-sm text-gray-500 font-medium">Kelompok Biaya Terdaftar</p>
             <button onClick={() => setShowCategoryModal(true)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md font-medium hover:bg-blue-200 transition-colors">Kelola Kategori</button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Grafik Pengeluaran per Kelompok Biaya (2026)</h3>
          <div className="h-40 flex items-end space-x-6 overflow-x-auto pb-2">
            {chartData.map((data, idx) => {
              const heightPct = (data.total / maxChartVal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center space-y-3 flex-shrink-0 w-12">
                  {/* Container Stacked Bar */}
                  <div className="w-10 flex flex-col justify-end rounded-t-md overflow-hidden relative bg-gray-50" style={{height: '9rem'}}>
                     <div className="w-full flex flex-col justify-end" style={{height: `${heightPct}%`}}>
                        {expenseCategories.map((cat, cIdx) => {
                            const catAmt = data.catTotals[cat] || 0;
                            if(catAmt === 0) return null;
                            const stackPct = (catAmt / data.total) * 100;
                            return (
                               <div 
                                  key={cat} 
                                  style={{height: `${stackPct}%`}} 
                                  className={`w-full ${catColors[cIdx % catColors.length]} hover:brightness-90 transition-all cursor-pointer`} 
                                  title={`${data.month} - ${cat}: ${formatRupiah(catAmt)}`}
                               ></div>
                            );
                        })}
                     </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100">
             {expenseCategories.map((cat, idx) => (
                <div key={cat} className="flex items-center space-x-1.5">
                   <div className={`w-3 h-3 rounded-full ${catColors[idx % catColors.length]}`}></div>
                   <span className="text-xs text-gray-500 font-medium">{cat}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Buku Pengeluaran</h3>
          <div className="flex space-x-2">
             <label className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center cursor-pointer transition-colors hidden sm:flex">
                <Upload size={16} className="mr-1.5" /> Import
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => importFromExcel(e, 'expenses')} />
             </label>
             <button onClick={() => exportToExcel(expenses, 'Data_Pengeluaran_MARC')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors hidden sm:flex">
                <Download size={16} className="mr-1.5" /> Export
             </button>
             <button onClick={() => setShowExpenseModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
               <Plus size={16} className="mr-2" /> Catat Pengeluaran
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Kelompok Biaya</th>
                <th className="p-4 font-medium">Keterangan</th>
                <th className="p-4 font-medium text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-gray-600">{exp.date}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-800">{exp.description}</td>
                  <td className="p-4 font-semibold text-red-600 text-right">-{formatRupiah(exp.amount)}</td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Belum ada pengeluaran di bulan ini.</td></tr>
              )}
            </tbody>
            {filteredExpenses.length > 0 && (
               <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                     <td colSpan="3" className="p-4 text-right font-bold text-gray-600">Total Filtered:</td>
                     <td className="p-4 text-right font-bold text-red-600">-{formatRupiah(totalExpFiltered)}</td>
                  </tr>
               </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Categories Modal (Kelola Kategori Global) */}
      {showCategoryModal && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Kelompok Biaya</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                 <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nama kategori baru..." className="flex-1 border border-gray-300 rounded-lg p-2 outline-none text-sm"/>
                 <button onClick={handleAddCategory} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Tambah</button>
              </div>
              <ul className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2">
                 {expenseCategories.map((cat, idx) => (
                    <li key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded border border-gray-100">
                       <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${catColors[idx % catColors.length]}`}></div>
                          <span className="text-sm text-gray-700 font-medium">{cat}</span>
                       </div>
                    </li>
                 ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Catat Pengeluaran</h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok Biaya</label>
                {!isAddingNewCatInForm ? (
                   <div className="flex gap-2">
                      <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                         {expenseCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => setIsAddingNewCatInForm(true)} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                         + Baru
                      </button>
                   </div>
                ) : (
                   <div className="flex gap-2">
                      <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ketik nama kelompok baru..." className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                      <button onClick={() => {setIsAddingNewCatInForm(false); setNewCatName('');}} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                         Batal
                      </button>
                   </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Deskripsi</label>
                <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="Contoh: Beli Kertas HVS" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} placeholder="Contoh: 150000" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
              <button onClick={handleAddExpense} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg flex items-center transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )};

  const renderLaporan = () => {
    // 1. Calculate Base Values based on Report Type (YTD vs Standalone)
    let baseIncome = 0;
    let baseExpense = 0;
    
    if (reportType === 'standalone') {
       const monthData = monthlyData.find(m => m.month === currentMonth);
       if (monthData) {
          baseIncome = monthData.income;
          baseExpense = monthData.expense;
       }
    } else { // YTD
       const currentMonthIdx = monthlyData.findIndex(m => m.month === currentMonth);
       const ytdData = monthlyData.slice(0, currentMonthIdx + 1);
       baseIncome = ytdData.reduce((sum, d) => sum + d.income, 0);
       baseExpense = ytdData.reduce((sum, d) => sum + d.expense, 0);
    }

    // 2. Sum Custom Accounts for LR
    const customIncomeTotal = customAccounts.lrIncome.reduce((sum, acc) => sum + acc.value, 0);
    const customExpenseTotal = customAccounts.lrExpense.reduce((sum, acc) => sum + acc.value, 0);

    const grossIncome = baseIncome + customIncomeTotal;
    const grossExpense = baseExpense + customExpenseTotal;
    const netProfit = grossIncome - grossExpense;

    // 3. Balance Sheet (Neraca) always point in time, but depends on retained earnings (net profit)
    const kasBank = saldoTerakhir;
    const piutang = totalTunggakan;
    const customAssetsTotal = customAccounts.neracaAsset.reduce((sum, acc) => sum + acc.value, 0);
    const totalAktiva = kasBank + piutang + customAssetsTotal;

    const customLiabilitiesTotal = customAccounts.neracaLiability.reduce((sum, acc) => sum + acc.value, 0);
    // Modal is balanced automatically: Aktiva - Kewajiban - Laba
    const modalSeimbang = totalAktiva - customLiabilitiesTotal - netProfit;
    const totalPasiva = customLiabilitiesTotal + modalSeimbang + netProfit;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Toggle YTD vs Standalone */}
        <div className="flex justify-center mb-8">
           <div className="bg-white p-1 rounded-lg inline-flex shadow-sm border border-gray-200">
              <button 
                 onClick={() => setReportType('standalone')} 
                 className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${reportType === 'standalone' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                 Bulan Ini ({currentMonth})
              </button>
              <button 
                 onClick={() => setReportType('ytd')} 
                 className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${reportType === 'ytd' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                 Year-to-Date (YTD)
              </button>
           </div>
        </div>
        
        {/* Laba Rugi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Laporan Laba / Rugi {reportType === 'ytd' ? '(YTD)' : `(${currentMonth})`}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Pendapatan Group */}
              <div>
                 <h4 className="font-bold text-blue-800 border-b pb-2 mb-3">PENDAPATAN</h4>
                 <div className="flex justify-between items-center py-1 text-sm">
                    <span className="text-gray-600">Pendapatan Operasional (Auto)</span>
                    <span className="font-semibold">{formatRupiah(baseIncome)}</span>
                 </div>
                 {customAccounts.lrIncome.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center py-1 gap-2 mt-1">
                       <input type="text" value={acc.name} onChange={e => updateCustomAccount('lrIncome', acc.id, 'name', e.target.value)} className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 flex-1 outline-none"/>
                       <input type="number" value={acc.value || ''} onChange={e => updateCustomAccount('lrIncome', acc.id, 'value', e.target.value)} className="text-sm font-semibold text-right w-32 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none"/>
                       <button onClick={() => removeCustomAccount('lrIncome', acc.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                 ))}
                 <button onClick={() => addCustomAccount('lrIncome')} className="text-xs text-blue-600 font-medium mt-2 flex items-center hover:underline"><Plus size={12} className="mr-1"/> Tambah Akun Pendapatan</button>
                 <div className="flex justify-between items-center py-2 mt-2 bg-blue-50 px-2 rounded">
                    <span className="font-bold text-blue-900 text-sm">Total Pendapatan</span>
                    <span className="font-bold text-blue-900">{formatRupiah(grossIncome)}</span>
                 </div>
              </div>

              {/* Pengeluaran Group */}
              <div>
                 <h4 className="font-bold text-red-800 border-b pb-2 mb-3">PENGELUARAN</h4>
                 <div className="flex justify-between items-center py-1 text-sm">
                    <span className="text-gray-600">Beban Operasional (Auto)</span>
                    <span className="font-semibold text-red-600">{formatRupiah(baseExpense)}</span>
                 </div>
                 {customAccounts.lrExpense.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center py-1 gap-2 mt-1">
                       <input type="text" value={acc.name} onChange={e => updateCustomAccount('lrExpense', acc.id, 'name', e.target.value)} className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 flex-1 outline-none"/>
                       <input type="number" value={acc.value || ''} onChange={e => updateCustomAccount('lrExpense', acc.id, 'value', e.target.value)} className="text-sm font-semibold text-right text-red-600 w-32 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none"/>
                       <button onClick={() => removeCustomAccount('lrExpense', acc.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                 ))}
                 <button onClick={() => addCustomAccount('lrExpense')} className="text-xs text-blue-600 font-medium mt-2 flex items-center hover:underline"><Plus size={12} className="mr-1"/> Tambah Akun Beban</button>
                 <div className="flex justify-between items-center py-2 mt-2 bg-red-50 px-2 rounded">
                    <span className="font-bold text-red-900 text-sm">Total Pengeluaran</span>
                    <span className="font-bold text-red-900">{formatRupiah(grossExpense)}</span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col justify-center bg-slate-50 p-8 rounded-xl border border-slate-200 text-center">
                <span className="font-bold text-slate-500 uppercase tracking-widest text-sm mb-4">Laba / Rugi Bersih</span>
                <span className={`font-black text-5xl ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatRupiah(netProfit)}
                </span>
                <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400 text-left">
                   * Nilai "Auto" ditarik langsung dari modul Invoice & Pengeluaran.<br/>
                   * Anda dapat menambahkan akun manual untuk penyesuaian khusus.
                </div>
            </div>
          </div>
        </div>

        {/* Neraca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Laporan Neraca / Balance Sheet</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AKTIVA */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">AKTIVA (Aset)</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm items-center py-1">
                  <span className="text-gray-600">Kas & Rekening Bank (Auto)</span>
                  <span className="font-medium">{formatRupiah(kasBank)}</span>
                </div>
                <div className="flex justify-between text-sm items-center py-1">
                  <span className="text-gray-600">Piutang Usaha (Auto)</span>
                  <span className="font-medium">{formatRupiah(piutang)}</span>
                </div>
                
                {/* Dynamic Asset Accounts */}
                {customAccounts.neracaAsset.map(acc => (
                   <div key={acc.id} className="flex justify-between items-center py-1 gap-2">
                       <input type="text" value={acc.name} onChange={e => updateCustomAccount('neracaAsset', acc.id, 'name', e.target.value)} className="text-sm text-gray-600 border-b border-gray-200 border-dashed focus:border-blue-400 px-1 flex-1 outline-none bg-transparent"/>
                       <input type="number" value={acc.value || ''} onChange={e => updateCustomAccount('neracaAsset', acc.id, 'value', e.target.value)} className="text-sm font-medium text-right w-32 border border-blue-100 bg-blue-50 rounded px-2 py-1 outline-none"/>
                       <button onClick={() => removeCustomAccount('neracaAsset', acc.id)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                    </div>
                ))}
                <button onClick={() => addCustomAccount('neracaAsset')} className="text-xs text-blue-600 font-medium mt-2 flex items-center hover:underline"><Plus size={12} className="mr-1"/> Tambah Akun Aset</button>

                <div className="flex justify-between font-bold text-gray-800 pt-4 mt-4 border-t-2 border-gray-800">
                  <span>Total Aktiva</span>
                  <span>{formatRupiah(totalAktiva)}</span>
                </div>
              </div>
            </div>
            
            {/* PASIVA */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">PASIVA (Kewajiban & Modal)</h4>
              <div className="space-y-3">
                
                {/* Dynamic Liability Accounts */}
                {customAccounts.neracaLiability.map(acc => (
                   <div key={acc.id} className="flex justify-between items-center py-1 gap-2">
                       <input type="text" value={acc.name} onChange={e => updateCustomAccount('neracaLiability', acc.id, 'name', e.target.value)} className="text-sm text-gray-600 border-b border-gray-200 border-dashed focus:border-orange-400 px-1 flex-1 outline-none bg-transparent"/>
                       <input type="number" value={acc.value || ''} onChange={e => updateCustomAccount('neracaLiability', acc.id, 'value', e.target.value)} className="text-sm font-medium text-right w-32 border border-orange-100 bg-orange-50 rounded px-2 py-1 outline-none"/>
                       <button onClick={() => removeCustomAccount('neracaLiability', acc.id)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                    </div>
                ))}
                 <button onClick={() => addCustomAccount('neracaLiability')} className="text-xs text-blue-600 font-medium mt-2 flex items-center hover:underline mb-4"><Plus size={12} className="mr-1"/> Tambah Akun Hutang</button>

                <div className="flex justify-between text-sm items-center py-1 bg-gray-50 px-2 rounded">
                  <span className="text-gray-600">Modal Penyeimbang (Auto)</span>
                  <span className="font-medium text-gray-500">{formatRupiah(modalSeimbang)}</span>
                </div>
                <div className="flex justify-between text-sm items-center py-1 bg-gray-50 px-2 rounded">
                  <span className="text-gray-600">Laba / Rugi (Dari System)</span>
                  <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRupiah(netProfit)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 pt-4 mt-4 border-t-2 border-gray-800">
                  <span>Total Pasiva</span>
                  <span>{formatRupiah(totalPasiva)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global CSS required for print functionality to hide everything except the invoice */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-area, #printable-area * { visibility: visible; }
            #printable-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; z-index: 9999; }
            .print-hide { display: none !important; }
          }
        `}
      </style>

      {/* Main Screen Layout (Hidden during print) */}
      <div className={`flex h-screen bg-gray-50 font-sans ${printData ? 'hidden' : ''}`}>
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 hidden md:flex">
          <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">M</div>
            <span className="text-xl font-bold tracking-wide">MARC Finance</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'klien', icon: Users, label: 'Daftar Klien' },
              { id: 'invoice', icon: FileText, label: 'Invoice & Tagihan' },
              { id: 'pengeluaran', icon: CreditCard, label: 'Pengeluaran' },
              { id: 'laporan', icon: BarChart3, label: 'Laporan & Neraca' },
            ].map(item => (
               <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                 <item.icon size={20} /> <span>{item.label}</span>
               </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 z-0">
            <div className="text-lg font-bold text-gray-800 capitalize">
              {activeTab === 'laporan' ? 'Pusat Laporan Keuangan' : activeTab.replace('-', ' ')}
            </div>
            <div className="flex items-center space-x-6">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Cari data..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">AD</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin Keuangan</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'klien' && renderKlien()}
            {activeTab === 'invoice' && renderInvoice()}
            {activeTab === 'pengeluaran' && renderPengeluaran()}
            {activeTab === 'laporan' && renderLaporan()}
          </div>
        </main>
      </div>

      {printData && (
        <div id="printable-area" className="bg-white min-h-screen p-10 font-sans text-gray-800">
           <div className="max-w-4xl mx-auto space-y-8">
             
             {/* Print Header */}
             <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter">MARC.</h1>
                  <p className="text-sm text-gray-500 mt-1">PT Solusi Imaji Indonesia<br/>Jl. Contoh Alamat No. 123, Tangerang</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-blue-600 uppercase tracking-widest">INVOICE</h2>
                  <p className="font-medium mt-2">No. {printData.id}</p>
                  <p className="text-sm text-gray-500">Tanggal: {printData.date}</p>
                </div>
             </div>

             {/* Bill To */}
             <div className="grid grid-cols-2 gap-8">
               <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tagihan Kepada:</h3>
                  <p className="font-bold text-lg">{printData.client}</p>
                  <p className="text-gray-600">Departemen Keuangan</p>
               </div>
               <div className="text-right bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tagihan</h3>
                  <p className="font-black text-3xl text-blue-700">{formatRupiah(printData.amount)}</p>
               </div>
             </div>

             {/* Item Table */}
             <div className="mt-12">
               <table className="w-full text-left">
                  <thead className="bg-gray-100 border-y border-gray-300">
                    <tr>
                       <th className="py-3 px-4 font-bold text-sm">Deskripsi Layanan / Tagihan</th>
                       <th className="py-3 px-4 font-bold text-sm text-right w-48">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                       <td className="py-4 px-4 text-gray-800">{printData.desc || 'Pembayaran Jasa / Retainer'}</td>
                       <td className="py-4 px-4 text-right font-medium">{formatRupiah(printData.amount)}</td>
                    </tr>
                  </tbody>
               </table>
             </div>

             {/* Footer / Payment Info */}
             <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
               <div>
                  <h4 className="font-bold mb-2">Instruksi Pembayaran:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Transfer ke Rekening Bank:<br/>
                    <strong>Bank BCA</strong> - 1234567890<br/>
                    A/N: PT Solusi Imaji Indonesia
                  </p>
               </div>
               <div className="text-center">
                  <p className="text-sm mb-16">Hormat Kami,</p>
                  <p className="font-bold border-t border-gray-400 pt-2 px-8">Finance MARC</p>
               </div>
             </div>

             {/* Action Buttons (Hidden in print) */}
             <div className="print-hide fixed bottom-8 right-8 flex space-x-4">
                <button onClick={() => setPrintData(null)} className="px-6 py-3 bg-white border border-gray-300 rounded-full shadow-lg font-medium hover:bg-gray-50">Tutup Tampilan</button>
                <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg font-medium flex items-center hover:bg-blue-700"><Printer size={18} className="mr-2"/> Cetak Sekarang</button>
             </div>
           </div>
        </div>
      )}
    </>
  );
}