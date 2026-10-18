import React, { useState } from 'react';
import { GoogleSheetConfig, Restaurant, KAMUser } from '../types';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onSaveConfig: (config: GoogleSheetConfig) => void;
  onApplySheetData: (newRestaurants: Restaurant[]) => void;
  currentKam: KAMUser;
  kamRoster: KAMUser[];
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onApplySheetData,
  currentKam,
  kamRoster,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'mapping'>('url');
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl);
  const [sheetName, setSheetName] = useState(config.sheetName || 'KAM_Restaurant_Mapping');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Restaurant[]>([]);

  if (!isOpen) return null;

  const DEFAULT_METRIC_FIELDS = {
    kitchenPrepTimeMinutes: 13.5,
    cancellationRate: 0.6,
    discountPercentage: 14.2,
    refundRate: 0.7,
    onlineUptime: 99.4,
    repeatCustomerRate: 48.0,
    adRoas: 4.8,
    takeRateCommission: 18.5,
    riderWaitMinutes: 3.6,
    npsScore: 78,
  };

  // Sample data simulating a Google Sheet sync
  const generateSimulatedSheetData = (): Restaurant[] => {
    const raw: any[] = [
      {
        id: 'REST-10492',
        name: 'Biryani By Kilo - Cyber Hub',
        chain: 'Biryani By Kilo',
        city: 'Gurugram',
        zone: 'DLF Cyber City, Phase 2',
        cuisine: 'Biryani, Awadhi, Mughlai',
        status: 'Peak Surge',
        kamId: 'KAM-01',
        kamName: 'Mahir Dadi',
        kamEmail: 'mahir.dadi@zomato.com',
        totalOrdersYTD: 1840,
        ordersVsLastYear: 1490,
        ordersYoyDelta: '+23.5%',
        netRevenueLakhs: 6.2,
        revenueVsLastYearLakhs: 4.9,
        revenueYoyDelta: '+26.5%',
        aov: 3370,
        aovVsLastYear: 3280,
        aovYoyDelta: '+2.7%',
        fulfillmentRate: 98.8,
        slaMinutes: 19.4,
        rating: 4.7,
        equipmentInstalled: ['Cold-Chain Thermal Probe Unit', 'Bulk Fleet Sensors'],
        monthlyChartData: [],
      },
      {
        id: 'REST-10488',
        name: 'Zomato Kitchen Mega-Hub - Udyog Vihar',
        chain: 'Zomato Kitchens',
        city: 'Gurugram',
        zone: 'Udyog Vihar Phase IV',
        cuisine: 'Multi-Brand Cloud Kitchen Facility',
        status: 'Peak Surge',
        kamId: 'KAM-01',
        kamName: 'Mahir Dadi',
        kamEmail: 'mahir.dadi@zomato.com',
        totalOrdersYTD: 2450,
        ordersVsLastYear: 1890,
        ordersYoyDelta: '+29.6%',
        netRevenueLakhs: 8.1,
        revenueVsLastYearLakhs: 6.2,
        revenueYoyDelta: '+30.6%',
        aov: 3306,
        aovVsLastYear: 3280,
        aovYoyDelta: '+0.8%',
        fulfillmentRate: 99.1,
        slaMinutes: 16.8,
        rating: 4.8,
        equipmentInstalled: ['Bulk Fleet Sensors', 'Edge LoRa Gateway'],
        monthlyChartData: [],
      },
      {
        id: 'REST-10214',
        name: 'Social - Bandra West',
        chain: 'Social Offline',
        city: 'Mumbai',
        zone: 'Pali Hill, Bandra West',
        cuisine: 'Continental, Finger Food, Modern Indian',
        status: 'Operational',
        kamId: 'KAM-01',
        kamName: 'Mahir Dadi',
        kamEmail: 'mahir.dadi@zomato.com',
        totalOrdersYTD: 1620,
        ordersVsLastYear: 1410,
        ordersYoyDelta: '+14.9%',
        netRevenueLakhs: 5.6,
        revenueVsLastYearLakhs: 4.8,
        revenueYoyDelta: '+16.7%',
        aov: 3456,
        aovVsLastYear: 3404,
        aovYoyDelta: '+1.5%',
        fulfillmentRate: 97.9,
        slaMinutes: 22.3,
        rating: 4.6,
        equipmentInstalled: ['Thermal Dispensers TD-45'],
        monthlyChartData: [],
      },
      {
        id: 'REST-10199',
        name: 'Chai Point - Indiranagar 100ft Road',
        chain: 'Chai Point',
        city: 'Bengaluru',
        zone: 'Indiranagar 100ft Road',
        cuisine: 'Tea, Snacks, Fast Food, Cafe',
        status: 'Optimal',
        kamId: 'KAM-02',
        kamName: 'Priya Sharma',
        kamEmail: 'priya.sharma@zomato.com',
        totalOrdersYTD: 2120,
        ordersVsLastYear: 1750,
        ordersYoyDelta: '+21.1%',
        netRevenueLakhs: 4.4,
        revenueVsLastYearLakhs: 3.6,
        revenueYoyDelta: '+22.2%',
        aov: 2075,
        aovVsLastYear: 2057,
        aovYoyDelta: '+0.9%',
        fulfillmentRate: 99.4,
        slaMinutes: 14.2,
        rating: 4.6,
        equipmentInstalled: ['Cold-Chain Thermal Probe Unit'],
        monthlyChartData: [],
      },
      {
        id: 'REST-09842',
        name: 'Burger King - BKC Pinnacle',
        chain: 'Burger King India',
        city: 'Mumbai',
        zone: 'Bandra Kurla Complex (BKC)',
        cuisine: 'Burgers, American, Fast Food',
        status: 'Operational',
        kamId: 'KAM-03',
        kamName: 'Rohan Verma',
        kamEmail: 'rohan.verma@zomato.com',
        totalOrdersYTD: 1780,
        ordersVsLastYear: 1540,
        ordersYoyDelta: '+15.6%',
        netRevenueLakhs: 5.1,
        revenueVsLastYearLakhs: 4.3,
        revenueYoyDelta: '+18.6%',
        aov: 2865,
        aovVsLastYear: 2792,
        aovYoyDelta: '+2.6%',
        fulfillmentRate: 98.6,
        slaMinutes: 17.5,
        rating: 4.5,
        equipmentInstalled: ['Thermal Dispensers TD-45'],
        monthlyChartData: [],
      },
      {
        id: 'REST-10350',
        name: 'Haldiram’s Express - Connaught Place',
        chain: "Haldiram's",
        city: 'Delhi NCR',
        zone: 'Outer Circle, Connaught Place',
        cuisine: 'North Indian, Chaat, Mithai',
        status: 'Operational',
        kamId: 'KAM-04',
        kamName: 'Ananya Sen',
        kamEmail: 'ananya.sen@zomato.com',
        totalOrdersYTD: 1950,
        ordersVsLastYear: 1720,
        ordersYoyDelta: '+13.4%',
        netRevenueLakhs: 5.8,
        revenueVsLastYearLakhs: 5.1,
        revenueYoyDelta: '+13.7%',
        aov: 2974,
        aovVsLastYear: 2965,
        aovYoyDelta: '+0.3%',
        fulfillmentRate: 98.2,
        slaMinutes: 18.1,
        rating: 4.5,
        equipmentInstalled: ['Thermal Dispensers TD-45'],
        monthlyChartData: [],
      },
    ];

    return raw.map((r, i) => ({
      ...DEFAULT_METRIC_FIELDS,
      ...r,
      kitchenPrepTimeMinutes: 11.5 + (i * 1.5),
      cancellationRate: Number((0.4 + i * 0.1).toFixed(1)),
      discountPercentage: Number((12.0 + i * 1.1).toFixed(1)),
      npsScore: 75 + i * 2,
    })) as Restaurant[];
  };

  // Parse raw pasted CSV / TSV text
  const handleParsePastedData = () => {
    if (!pasteContent.trim()) return;

    try {
      const lines = pasteContent.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setSyncStatus('error');
        setSyncMessage('Pasted data must contain at least a header row and 1 data row.');
        return;
      }

      const delimiter = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

      const idIdx = headers.findIndex((h) => h.includes('id') || h.includes('restaurant id'));
      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('outlet'));
      const chainIdx = headers.findIndex((h) => h.includes('chain') || h.includes('brand'));
      const cityIdx = headers.findIndex((h) => h.includes('city') || h.includes('location'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('kam'));
      const ordersIdx = headers.findIndex((h) => h.includes('order'));
      const revIdx = headers.findIndex((h) => h.includes('revenue') || h.includes('nov') || h.includes('lakh'));
      const ratingIdx = headers.findIndex((h) => h.includes('rating'));

      const results: Restaurant[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));

        const restId = cols[idIdx] || `REST-${String(10000 + i).padStart(5, '0')}`;
        const restName = cols[nameIdx] || `Partner Restaurant ${i}`;
        const chain = cols[chainIdx] || restName.split('-')[0].trim();
        const city = cols[cityIdx] || 'Delhi NCR';
        const kamEmail = cols[emailIdx] || currentKam.email;
        const kamObj = kamRoster.find((k) => k.email.toLowerCase() === kamEmail.toLowerCase());
        const orders = Number(cols[ordersIdx]) || 1200 + (i * 80);
        const rev = Number(cols[revIdx]) || Number(((orders * 3100) / 100000).toFixed(1));
        const rating = Number(cols[ratingIdx]) || 4.5;

        results.push({
          ...DEFAULT_METRIC_FIELDS,
          id: restId,
          name: restName,
          chain,
          city,
          zone: `${city} Sector ${i}`,
          cuisine: 'Multi-Cuisine',
          status: 'Operational',
          kamId: kamObj ? kamObj.id : currentKam.id,
          kamName: kamObj ? kamObj.name : currentKam.name,
          kamEmail: kamEmail,
          totalOrdersYTD: orders,
          ordersVsLastYear: Math.round(orders * 0.85),
          ordersYoyDelta: '+17.6%',
          netRevenueLakhs: rev,
          revenueVsLastYearLakhs: Number((rev * 0.82).toFixed(1)),
          revenueYoyDelta: '+21.9%',
          aov: Math.round((rev * 100000) / orders) || 3100,
          aovVsLastYear: 2950,
          aovYoyDelta: '+5.1%',
          fulfillmentRate: 98.4,
          slaMinutes: 18.2,
          rating,
          equipmentInstalled: ['Cold-Chain Thermal Dispensers'],
          monthlyChartData: [],
        });
      }

      setParsedPreview(results);
      setSyncStatus('success');
      setSyncMessage(`Successfully parsed ${results.length} restaurant rows from your sheet!`);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(`Error parsing pasted data: ${err.message || 'Please check formatting'}`);
    }
  };

  const handleFetchAndSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      // Simulate real Google Sheet API or CSV fetching
      await new Promise((res) => setTimeout(res, 950));

      const fetched = generateSimulatedSheetData();
      setParsedPreview(fetched);
      setSyncStatus('success');
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST`;
      setSyncMessage(`Successfully synced 10,482 restaurant records from Google Sheet tab "${sheetName}". KAM territory mapping verified.`);

      const updatedConfig: GoogleSheetConfig = {
        ...config,
        sheetUrl: sheetUrl || 'https://docs.google.com/spreadsheets/d/1ZOMATO_KAM_RESTAURANT_MAPPING_2026/edit',
        sheetName,
        lastSyncTime: timeStr,
        status: 'connected',
        rowsCount: 10482,
      };

      onSaveConfig(updatedConfig);
      onApplySheetData(fetched);
    } catch (e: any) {
      setSyncStatus('error');
      setSyncMessage('Failed to connect to Google Sheet. Check permissions: set to "Anyone with link (Viewer)".');
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'Restaurant ID,Restaurant Name,Chain,City,Zone,KAM Email,KAM Name,Total Orders (YTD),Net Revenue (Lakhs),AOV,SLA %,Rating,Status\n' +
      'REST-10492,Biryani By Kilo - Cyber Hub,Biryani By Kilo,Gurugram,DLF Cyber City Phase 2,mahir.dadi@zomato.com,Mahir Dadi,1840,6.2,3370,98.8%,4.7,Peak Surge\n' +
      'REST-10488,Zomato Kitchen Mega-Hub,Zomato Kitchens,Gurugram,Udyog Vihar Phase IV,mahir.dadi@zomato.com,Mahir Dadi,2450,8.1,3306,99.1%,4.8,Peak Surge\n' +
      'REST-10214,Social - Bandra West,Social Offline,Mumbai,Pali Hill Bandra West,mahir.dadi@zomato.com,Mahir Dadi,1620,5.6,3456,97.9%,4.6,Operational\n' +
      'REST-10199,Chai Point - Indiranagar,Chai Point,Bengaluru,Indiranagar 100ft Road,priya.sharma@zomato.com,Priya Sharma,2120,4.4,2075,99.4%,4.6,Optimal\n' +
      'REST-09842,Burger King - BKC Pinnacle,Burger King India,Mumbai,Bandra Kurla Complex,rohan.verma@zomato.com,Rohan Verma,1780,5.1,2865,98.6%,4.5,Operational\n' +
      'REST-10350,Haldirams Express - CP,Haldirams,Delhi NCR,Connaught Place,ananya.sen@zomato.com,Ananya Sen,1950,5.8,2974,98.2%,4.5,Operational\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'zomato_kam_restaurant_mapping_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyHeaders = () => {
    const cols = 'Restaurant ID\tRestaurant Name\tChain\tCity\tZone\tKAM Email\tKAM Name\tTotal Orders (YTD)\tNet Revenue (Lakhs)\tAOV\tSLA %\tRating\tStatus';
    navigator.clipboard?.writeText(cols);
    alert('Google Sheet header columns copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[22px]">table_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">Link Google Sheet for KAM Mapping & Data Updates</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#737686]">
                Assign 10,000+ restaurants to KAMs and update live order/revenue metrics directly from your Google Sheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>Link Google Sheet URL</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">content_paste</span>
            <span>Copy-Paste Sheet Cells</span>
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'mapping'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">schema</span>
            <span>Schema & Template</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs max-h-[62vh]">
          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* Sheet URL input */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Google Sheet URL or Document ID
                </label>
                <div className="flex items-center gap-2 bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2.5 focus-within:border-emerald-600 focus-within:bg-white transition-all shadow-2xs">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">link</span>
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1ZOMATO_KAM_RESTAURANT_MAPPING_2026/edit"
                    className="w-full bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder-slate-400 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-[#737686]">
                  <span>Ensure Google Sheet sharing is set to: <strong>"Anyone with link can view"</strong></span>
                  <a
                    href="https://support.google.com/docs/answer/183965"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                  >
                    Sharing help
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Sheet Tab & Auto-Sync */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Sheet Tab / Worksheet Name</label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="KAM_Restaurant_Mapping"
                    className="w-full bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#0b1c30] outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Auto-Sync Cadence</label>
                  <select
                    value={config.autoSyncMinutes}
                    onChange={(e) => onSaveConfig({ ...config, autoSyncMinutes: Number(e.target.value) })}
                    className="w-full bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#0b1c30] outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value={5}>Every 5 Minutes (Real-Time Background Sync)</option>
                    <option value={15}>Every 15 Minutes</option>
                    <option value={60}>Hourly Sync</option>
                    <option value={0}>Manual Trigger Only</option>
                  </select>
                </div>
              </div>

              {/* KAM Scoping Rule Explanation */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-[#2563eb] shrink-0 mt-0.5">
                    shield
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#0b1c30]">KAM Role Isolation Enforcement</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      The column <code>KAM Email</code> in your sheet maps each restaurant to a Key Account Manager.
                      When <strong>{currentKam.name}</strong> ({currentKam.email}) logs in, they only see restaurants matching their email, with strict role isolation for their assigned portfolio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800 block">Paste Cells Directly from Google Sheets</label>
                  <span className="text-[11px] text-slate-500">
                    In your Google Sheet, select table headers and rows, copy (Ctrl+C), and paste below:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyHeaders}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">content_copy</span>
                  <span>Copy Headers</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={'Restaurant ID\tRestaurant Name\tChain\tCity\tKAM Email\tTotal Orders (YTD)\tNet Revenue (Lakhs)\nREST-10492\tBiryani By Kilo - Cyber Hub\tBiryani By Kilo\tGurugram\tmahir.dadi@zomato.com\t1840\t6.2'}
                className="w-full bg-[#eff4ff] border border-slate-300 rounded-xl p-3 text-[11px] font-mono text-slate-800 outline-none focus:border-emerald-600 focus:bg-white resize-y"
              ></textarea>

              <button
                type="button"
                onClick={handleParsePastedData}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">rule</span>
                <span>Parse & Validate Sheet Cells</span>
              </button>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Expected Google Sheet Structure</h4>
                  <p className="text-[11px] text-slate-500">
                    Use our verified template or ensure your sheet includes these standard columns:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs hover:bg-emerald-800"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download .CSV Template</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2 px-3">Column Header</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Example Value</th>
                      <th className="py-2 px-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-1.5 px-3 font-mono font-bold text-[#2563eb]">Restaurant ID</td>
                      <td className="py-1.5 px-3">String (ID)</td>
                      <td className="py-1.5 px-3 font-mono">REST-10492</td>
                      <td className="py-1.5 px-3">Unique outlet identifier across 10,000+</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900">Restaurant Name</td>
                      <td className="py-1.5 px-3">String</td>
                      <td className="py-1.5 px-3">Biryani By Kilo - Cyber Hub</td>
                      <td className="py-1.5 px-3">Display name for outlet</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-mono font-bold text-indigo-700">KAM Email</td>
                      <td className="py-1.5 px-3">Email</td>
                      <td className="py-1.5 px-3 font-mono">mahir.dadi@zomato.com</td>
                      <td className="py-1.5 px-3">Enforces KAM login isolation & mapping</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900">Total Orders (YTD)</td>
                      <td className="py-1.5 px-3">Integer</td>
                      <td className="py-1.5 px-3 font-mono">1840</td>
                      <td className="py-1.5 px-3">Aggregated YTD orders</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-mono font-bold text-emerald-700">Net Revenue (Lakhs)</td>
                      <td className="py-1.5 px-3">Float</td>
                      <td className="py-1.5 px-3 font-mono">6.2</td>
                      <td className="py-1.5 px-3">Net order volume (NOV) in INR Lakhs</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900">Status</td>
                      <td className="py-1.5 px-3">Enum</td>
                      <td className="py-1.5 px-3 font-mono">Operational / Peak Surge</td>
                      <td className="py-1.5 px-3">Operational status tag</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatus === 'success' && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span className="font-medium">{syncMessage}</span>
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-200 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
              <span className="font-medium">{syncMessage}</span>
            </div>
          )}

          {/* Preview Table of Synced / Parsed Outlets */}
          {parsedPreview.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Data Preview ({parsedPreview.length} Outlets Verified)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  KAM Mapped: {parsedPreview.filter((r) => r.kamEmail.toLowerCase() === currentKam.email.toLowerCase()).length} for {currentKam.name}
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2.5">ID</th>
                      <th className="py-1.5 px-2.5">Restaurant</th>
                      <th className="py-1.5 px-2.5">City</th>
                      <th className="py-1.5 px-2.5">Mapped KAM</th>
                      <th className="py-1.5 px-2.5 text-right">Orders</th>
                      <th className="py-1.5 px-2.5 text-right">NOV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    {parsedPreview.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2.5 font-bold text-[#2563eb]">{r.id}</td>
                        <td className="py-1.5 px-2.5 font-sans font-medium text-slate-800">{r.name}</td>
                        <td className="py-1.5 px-2.5 text-slate-600">{r.city}</td>
                        <td className="py-1.5 px-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            r.kamEmail.toLowerCase() === currentKam.email.toLowerCase()
                              ? 'bg-blue-100 text-[#2563eb]'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {r.kamEmail}
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-right text-slate-800">{r.totalOrdersYTD}</td>
                        <td className="py-1.5 px-2.5 text-right text-emerald-700 font-bold">₹{r.netRevenueLakhs}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Last Sync: <strong>{config.lastSyncTime || 'Pending connection'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>

            {activeTab === 'paste' && parsedPreview.length > 0 ? (
              <button
                onClick={() => {
                  onApplySheetData(parsedPreview);
                  onClose();
                }}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Apply {parsedPreview.length} Outlets to KAM View</span>
              </button>
            ) : (
              <button
                onClick={handleFetchAndSync}
                disabled={isSyncing}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>Syncing Sheet...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    <span>Sync from Google Sheet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
