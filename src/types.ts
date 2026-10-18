export type NavigationTab = 
  | 'dashboard' 
  | 'restaurants'
  | 'master-sheet'
  | 'orders-and-revenue' 
  | 'customers' 
  | 'inventory' 
  | 'marketing-analytics' 
  | 'settings';

export interface KAMUser {
  id: string; // e.g. "KAM-01"
  name: string; // e.g. "Mahir Dadi"
  email: string; // e.g. "mahir.dadi@zomato.com"
  role: 'Senior Strategic KAM' | 'Regional Enterprise KAM' | 'Enterprise QSR KAM' | 'VP Operations (Admin)';
  region: string;
  avatarUrl?: string;
  isAdmin: boolean;
  assignedChains: string[];
  assignedRestaurantCount: number;
}

export interface GoogleSheetConfig {
  sheetUrl: string;
  sheetName: string;
  lastSyncTime: string;
  status: 'connected' | 'idle' | 'syncing' | 'error';
  rowsCount: number;
  autoSyncMinutes: number;
  kamColumn: string;
  restaurantIdColumn: string;
}

export interface MasterSheetMeta {
  url: string;
  name: string;
  lastCollated: string;
  totalOutlets: number;
  totalKams: number;
  totalNovLakhs: number;
  status: 'synced' | 'collating' | 'live';
  syncCadence: string;
}

export interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string; // e.g. "#ORD-9042"
  restaurantId: string; // e.g. "REST-10492"
  restaurantName: string;
  kamId?: string; // Mapped Key Account Manager ID
  clientName: string;
  clientInitials: string;
  clientColor: string;
  location: string;
  category: string;
  date: string;
  timestamp: string;
  value: number; // in INR
  status: 'Completed' | 'Processing' | 'In Transit' | 'Under Audit';
  yoyDelta: string; // e.g. "+34.8%"
  items?: OrderItem[];
  paymentMethod?: string;
  slaDeliveryHours?: number;
}

export interface Restaurant {
  id: string; // e.g. "REST-10492"
  name: string;
  chain: string;
  city: string;
  zone: string;
  cuisine: string;
  status: 'Operational' | 'Peak Surge' | 'High SLA Risk' | 'Optimal';
  kamId: string; // Mapped Key Account Manager ID e.g. "KAM-01"
  kamName: string; // e.g. "Mahir Dadi"
  kamEmail: string; // e.g. "mahir.dadi@zomato.com"
  
  // Core Order & Revenue Metrics
  totalOrdersYTD: number;
  ordersVsLastYear: number;
  ordersYoyDelta: string;
  netRevenueLakhs: number; // in Lakhs e.g. 4.8
  revenueVsLastYearLakhs: number;
  revenueYoyDelta: string;
  aov: number;
  aovVsLastYear: number;
  aovYoyDelta: string;
  fulfillmentRate: number;
  slaMinutes: number;
  rating: number;
  
  // Extended Operational & Commercial Metrics
  kitchenPrepTimeMinutes: number; // KPT e.g. 14.2 mins
  cancellationRate: number; // % e.g. 0.6%
  discountPercentage: number; // % e.g. 14.5%
  refundRate: number; // % e.g. 0.8%
  onlineUptime: number; // % e.g. 99.4%
  repeatCustomerRate: number; // % e.g. 44%
  adRoas: number; // Return on Ad Spend e.g. 4.6x
  takeRateCommission: number; // % e.g. 18.5%
  riderWaitMinutes: number; // Wait at restaurant e.g. 4.1 mins
  npsScore: number; // Customer NPS e.g. 74
  
  equipmentInstalled: string[];
  monthlyChartData: MonthlyChartPoint[];
}

export interface EnterpriseCustomer {
  id: string;
  name: string;
  initials: string;
  badgeBg: string;
  badgeText: string;
  location: string;
  tier: 'Tier-1 Strategic' | 'Tier-1 Enterprise' | 'Growth Enterprise';
  annualRunRate: string; // e.g. "₹42.5L"
  totalOrders: number;
  healthScore: number; // e.g. 98
  primaryContact: {
    name: string;
    email: string;
    role: string;
  };
  activeCategories: string[];
  status: 'Active' | 'Under Review' | 'Contract Renewal';
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  stockLevel: number;
  minThreshold: number;
  unitCost: number;
  reorderStatus: 'Optimal' | 'Low Stock' | 'Surplus';
  monthlyVelocity: string;
}

export interface MonthlyChartPoint {
  month: string;
  fullMonth: string;
  orders2025: number;
  orders2026: number | null; // null for future months
  ordersLabel2025: string;
  ordersLabel2026?: string;
  revenue2025: number; // in Lakhs
  revenue2026: number | null; // in Lakhs
  revLabel2025: string;
  revLabel2026?: string;
}
