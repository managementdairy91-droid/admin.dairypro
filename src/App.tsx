import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { DashboardView } from './components/DashboardView';
import { OwnersView } from './components/OwnersView';
import { SellersView } from './components/SellersView';
import { SettlementsView } from './components/SettlementsView';
import { CattleFeedView } from './components/CattleFeedView';
import { LeadsView } from './components/LeadsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import type { ContactRequest } from './components/LeadsView';
import type { SubscriptionRequestRecord, SubscriptionPaymentRecord } from './components/SubscriptionsView';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Receipt, 
  LogOut, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Box,
  CreditCard
} from 'lucide-react';

type ActiveTab = 'dashboard' | 'owners' | 'subscriptions' | 'sellers' | 'settlements' | 'feed' | 'leads';

interface OwnerProfile {
  id: string;
  full_name: string;
  phone_number: string | null;
  dairy_name: string | null;
  address: string | null;
  city_village: string | null;
  pincode: string | null;
  fat_rate: number | null;
  snf_rate: number | null;
  is_approved: boolean;
  subscription_status: string;
  subscription_plan?: string | null;
  subscription_expires_at: string | null;
  created_at: string;
}

interface SellerProfile {
  id: string;
  name: string;
  seller_code: string | null;
  phone_number?: string | null;
  village: string | null;
  address: string | null;
  balance_amount: number;
  is_active: boolean;
  owner_name: string;
  owner_dairy: string;
  created_at: string;
}

interface SettlementRecord {
  id: string;
  start_date: string;
  end_date: string;
  total_milk_amount: number;
  total_feed_deduction: number;
  total_advance_deduction?: number;
  net_payable: number;
  status: string;
  created_at: string;
  seller_name: string;
  seller_code: string | null;
  owner_name: string;
  owner_dairy: string;
}

interface FeedSaleRecord {
  id: string;
  brand_name: string;
  quantity: number;
  price_per_bag: number;
  total_amount: number;
  sale_date: string;
  is_settled: boolean;
  seller_name: string;
  seller_code: string | null;
  owner_name: string;
  owner_dairy: string;
}

interface FeedProductRecord {
  id: string;
  brand_name: string;
  price_per_bag: number;
  owner_name: string;
  owner_dairy: string;
  created_at: string;
}

function App() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Login Form input state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // App navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data state
  const [owners, setOwners] = useState<OwnerProfile[]>([]);
  const [leads, setLeads] = useState<ContactRequest[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [feedSales, setFeedSales] = useState<FeedSaleRecord[]>([]);
  const [feedProducts, setFeedProducts] = useState<FeedProductRecord[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequestRecord[]>([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPaymentRecord[]>([]);
  
  // Stats summary for dashboard
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalSellers: 0,
    pendingOwners: 0,
    totalMilkLiters: 0,
    totalMilkValue: 0,
    approvedSettlements: 0,
    pendingSettlements: 0,
    activeSubscriptions: 0,
    totalFeedBags: 0,
    totalFeedAmount: 0,
    pendingFeedDeductions: 0,
    pendingLeads: 0,
    pendingSubscriptionRequests: 0,
  });

  const [chartsData, setChartsData] = useState<{
    milkTrends: Array<{ date: string; quantity: number }>;
    settlementTrends: Array<{ date: string; amount: number }>;
  }>({ milkTrends: [], settlementTrends: [] });

  // 1. Auth Change Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
      } else {
        setLoadingAuth(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminStatus(session.user.id);
      } else {
        setIsSuperAdmin(false);
        setUserProfile(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      setLoadingAuth(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user profile:', error);
        setIsSuperAdmin(false);
      } else {
        setUserProfile(data);
        setIsSuperAdmin(data.is_super_admin === true);
      }
    } catch (err) {
      console.error(err);
      setIsSuperAdmin(false);
    } finally {
      setLoadingAuth(false);
    }
  };

  // 2. Fetch Dashboard & View Data
  const loadAllData = async () => {
    if (!session || !isSuperAdmin) return;
    setIsRefreshing(true);

    try {
      // A. Fetch Owners
      const { data: ownersData, error: ownersErr } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'owner')
        .order('created_at', { ascending: false });

      if (ownersErr) throw ownersErr;
      const formattedOwners: OwnerProfile[] = ownersData || [];
      setOwners(formattedOwners);

      // B. Fetch Sellers (with owner joined details)
      const { data: sellersData, error: sellersErr } = await supabase
        .from('sellers')
        .select('*, owner:users!sellers_owner_id_fkey(full_name, dairy_name)')
        .order('created_at', { ascending: false });

      if (sellersErr) throw sellersErr;
      const formattedSellers: SellerProfile[] = (sellersData || []).map(s => ({
        id: s.id,
        name: s.name || 'Unnamed Seller',
        seller_code: s.seller_code,
        phone_number: s.phone_number,
        village: s.village,
        address: s.address,
        balance_amount: Number(s.balance_amount) || 0,
        is_active: s.is_active !== false,
        owner_name: s.owner?.full_name || 'System Admin',
        owner_dairy: s.owner?.dairy_name || 'Central Dairy',
        created_at: s.created_at
      }));
      setSellers(formattedSellers);

      // C. Fetch Cattle Feed Products
      const { data: productsData, error: productsErr } = await supabase
        .from('feed_products')
        .select('*, owner:users!feed_products_owner_id_fkey(full_name, dairy_name)')
        .order('created_at', { ascending: false });

      if (productsErr) throw productsErr;
      const formattedFeedProducts: FeedProductRecord[] = (productsData || []).map(prod => ({
        id: prod.id,
        brand_name: prod.brand_name || 'Generic Product',
        price_per_bag: Number(prod.price_per_bag) || 0,
        owner_name: prod.owner?.full_name || 'System Admin',
        owner_dairy: prod.owner?.dairy_name || 'Central Dairy',
        created_at: prod.created_at
      }));
      setFeedProducts(formattedFeedProducts);

      // D. Fetch Cattle Feed Sales
      const { data: salesData, error: salesErr } = await supabase
        .from('feed_sales')
        .select('*, owner:users!feed_sales_owner_id_fkey(full_name, dairy_name), seller:sellers!feed_sales_seller_id_fkey(name, seller_code)')
        .order('created_at', { ascending: false });

      if (salesErr) throw salesErr;
      const formattedFeedSales: FeedSaleRecord[] = (salesData || []).map(sale => ({
        id: sale.id,
        brand_name: sale.brand_name || 'Generic Feed',
        quantity: Number(sale.quantity) || 0,
        price_per_bag: Number(sale.price_per_bag) || 0,
        total_amount: Number(sale.total_amount) || 0,
        sale_date: sale.sale_date,
        is_settled: sale.is_settled === true,
        seller_name: sale.seller?.name || 'Unknown Supplier',
        seller_code: sale.seller?.seller_code || null,
        owner_name: sale.owner?.full_name || 'System Admin',
        owner_dairy: sale.owner?.dairy_name || 'Central Dairy'
      }));
      setFeedSales(formattedFeedSales);

      // E. Fetch Completed Settlements (with joined details)
      const { data: settlementsData, error: settlementsErr } = await supabase
        .from('settlements')
        .select('*, owner:users!settlements_owner_id_fkey(full_name, dairy_name), seller:sellers!settlements_seller_id_fkey(name, seller_code)')
        .order('created_at', { ascending: false });

      if (settlementsErr) throw settlementsErr;
      const formattedSettlements: SettlementRecord[] = (settlementsData || []).map(setl => ({
        id: setl.id,
        start_date: setl.start_date,
        end_date: setl.end_date,
        total_milk_amount: Number(setl.total_milk_amount) || 0,
        total_feed_deduction: Number(setl.total_feed_deduction) || 0,
        total_advance_deduction: Number(setl.total_advance_deduction) || 0,
        net_payable: Number(setl.net_payable) || 0,
        status: setl.status || 'completed',
        created_at: setl.created_at,
        seller_name: setl.seller?.name || 'Unknown Supplier',
        seller_code: setl.seller?.seller_code || null,
        owner_name: setl.owner?.full_name || 'Central Owner',
        owner_dairy: setl.owner?.dairy_name || 'Central Dairy'
      }));

      // E2. Fetch Unsettled Advances for accurate net settlement deduction
      let unsettledAdvances: any[] = [];
      try {
        const { data: advancesData } = await supabase
          .from('advances')
          .select('seller_id, owner_id, amount, is_settled')
          .eq('is_settled', false);
        if (advancesData) unsettledAdvances = advancesData;
      } catch (advErr) {
        console.warn('Could not load unsettled advances:', advErr);
      }

      // F. Fetch Unsettled Milk Entries to construct grouped pending settlements
      const { data: pendingMilkEntries, error: pendingMilkErr } = await supabase
        .from('milk_entries')
        .select('*, owner:users!milk_entries_owner_id_fkey(full_name, dairy_name), seller:sellers!milk_entries_seller_id_fkey(name, seller_code)')
        .eq('is_settled', false);

      if (pendingMilkErr) throw pendingMilkErr;

      const pendingGroups: { [key: string]: {
        owner_id: string;
        seller_id: string;
        owner_name: string;
        owner_dairy: string;
        seller_name: string;
        seller_code: string | null;
        dates: string[];
        total_milk_amount: number;
      } } = {};

      (pendingMilkEntries || []).forEach(entry => {
        if (!entry.owner_id || !entry.seller_id) return;
        const key = `${entry.owner_id}_${entry.seller_id}`;
        if (!pendingGroups[key]) {
          pendingGroups[key] = {
            owner_id: entry.owner_id,
            seller_id: entry.seller_id,
            owner_name: entry.owner?.full_name || 'Central Owner',
            owner_dairy: entry.owner?.dairy_name || 'Central Dairy',
            seller_name: entry.seller?.name || 'Unknown Supplier',
            seller_code: entry.seller?.seller_code || null,
            dates: [],
            total_milk_amount: 0
          };
        }
        pendingGroups[key].dates.push(entry.collection_date);
        pendingGroups[key].total_milk_amount += Number(entry.total_amount) || 0;
      });

      const generatedPendingSettlements: SettlementRecord[] = Object.keys(pendingGroups).map(key => {
        const group = pendingGroups[key];
        const groupFeedDeduction = formattedFeedSales
          .filter(s => !s.is_settled && s.seller_code === group.seller_code && s.owner_dairy === group.owner_dairy)
          .reduce((acc, curr) => acc + curr.total_amount, 0);

        const groupAdvanceDeduction = unsettledAdvances
          .filter(a => a.seller_id === group.seller_id && a.owner_id === group.owner_id)
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const sortedDates = group.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const startDate = sortedDates[0] || new Date().toISOString().split('T')[0];
        const endDate = sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0];

        return {
          id: `pending_${group.owner_id}_${group.seller_id}`,
          start_date: startDate,
          end_date: endDate,
          total_milk_amount: group.total_milk_amount,
          total_feed_deduction: groupFeedDeduction,
          total_advance_deduction: groupAdvanceDeduction,
          net_payable: Math.max(0, group.total_milk_amount - groupFeedDeduction - groupAdvanceDeduction),
          status: 'pending',
          created_at: new Date().toISOString(),
          seller_name: group.seller_name,
          seller_code: group.seller_code,
          owner_name: group.owner_name,
          owner_dairy: group.owner_dairy
        };
      });

      // Combine pending settlements and completed settlements for the log view
      setSettlements([...generatedPendingSettlements, ...formattedSettlements]);

      // G. Fetch all milk entries to calculate totals and charts
      const { data: milkEntries, error: milkErr } = await supabase
        .from('milk_entries')
        .select('quantity, total_amount, is_settled, collection_date');

      if (milkErr) throw milkErr;

      // H. Fetch Leads / Contact Requests (NEVER modified or altered)
      const { data: leadsData, error: leadsErr } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsErr) throw leadsErr;
      const formattedLeads: ContactRequest[] = (leadsData as any) || [];
      setLeads(formattedLeads);

      // I. Fetch Subscription Requests & Payments (with fallback resilience)
      let formattedSubRequests: SubscriptionRequestRecord[] = [];
      try {
        const { data: subReqsData, error: subReqsErr } = await supabase
          .from('subscription_requests')
          .select('*, owner:users!subscription_requests_user_id_fkey(full_name, dairy_name, phone_number)')
          .order('created_at', { ascending: false });
        
        if (!subReqsErr && subReqsData) {
          formattedSubRequests = subReqsData.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            plan_type: r.plan_type,
            amount: Number(r.amount) || 0,
            payment_reference: r.payment_reference || '',
            status: r.status || 'pending',
            notes: r.notes || '',
            created_at: r.created_at,
            owner_name: r.user_name || r.owner?.full_name || 'Central Owner',
            owner_dairy: r.dairy_name || r.owner?.dairy_name || 'Central Dairy',
            owner_phone: r.user_phone || r.owner?.phone_number || '',
            owner_email: r.user_email || ''
          }));
        }
      } catch (subErr) {
        console.warn('Subscription requests table not yet active:', subErr);
      }
      setSubscriptionRequests(formattedSubRequests);

      let formattedSubPayments: SubscriptionPaymentRecord[] = [];
      try {
        const { data: subPaysData, error: subPaysErr } = await supabase
          .from('subscription_payments')
          .select('*, owner:users!subscription_payments_user_id_fkey(full_name, dairy_name)')
          .order('created_at', { ascending: false });

        if (!subPaysErr && subPaysData) {
          formattedSubPayments = subPaysData.map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            plan_type: p.plan_type,
            amount: Number(p.amount) || 0,
            currency: p.currency || 'INR',
            razorpay_payment_id: p.razorpay_payment_id || null,
            status: p.status || 'captured',
            starts_at: p.starts_at || p.created_at,
            expires_at: p.expires_at || p.created_at,
            source: p.source || 'razorpay',
            created_at: p.created_at,
            owner_name: p.owner?.full_name || 'Central Owner',
            owner_dairy: p.owner?.dairy_name || 'Central Dairy'
          }));
        }
      } catch (payErr) {
        console.warn('Subscription payments table not yet active:', payErr);
      }
      setSubscriptionPayments(formattedSubPayments);

      // J. Calculate aggregate totals for KPI stats
      const totalLiters = (milkEntries || []).reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
      const totalMilkValueSum = (milkEntries || []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      
      const approvedPayouts = formattedSettlements.reduce((acc, curr) => acc + curr.net_payable, 0);
      const pendingPayouts = generatedPendingSettlements.reduce((acc, curr) => acc + curr.net_payable, 0);

      const pendingApprovalCount = formattedOwners.filter(o => !o.is_approved).length;
      const activeSubsCount = formattedOwners.filter(o => o.subscription_status === 'active').length;

      const totalFeedBagsCount = formattedFeedSales.reduce((acc, curr) => acc + curr.quantity, 0);
      const totalFeedAmountSum = formattedFeedSales.reduce((acc, curr) => acc + curr.total_amount, 0);
      const pendingFeedDeductionsVal = formattedFeedSales.filter(s => !s.is_settled).reduce((acc, curr) => acc + curr.total_amount, 0);
      
      const pendingLeadsVal = formattedLeads.filter(l => l.status === 'pending').length;
      const pendingSubRequestsVal = formattedSubRequests.filter(r => r.status === 'pending').length;

      setStats({
        totalOwners: formattedOwners.length,
        totalSellers: formattedSellers.length,
        pendingOwners: pendingApprovalCount,
        totalMilkLiters: totalLiters,
        totalMilkValue: totalMilkValueSum,
        approvedSettlements: approvedPayouts,
        pendingSettlements: pendingPayouts,
        activeSubscriptions: activeSubsCount,
        totalFeedBags: totalFeedBagsCount,
        totalFeedAmount: totalFeedAmountSum,
        pendingFeedDeductions: pendingFeedDeductionsVal,
        pendingLeads: pendingLeadsVal,
        pendingSubscriptionRequests: pendingSubRequestsVal,
      });

      // K. Construct Chart Trends (group by date)
      const milkByDate: { [key: string]: number } = {};
      (milkEntries || []).forEach(entry => {
        const dateStr = new Date(entry.collection_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        milkByDate[dateStr] = (milkByDate[dateStr] || 0) + Number(entry.quantity);
      });

      const milkChart = Object.keys(milkByDate).map(key => ({
        date: key,
        quantity: milkByDate[key]
      })).slice(-10);

      const settlementByDate: { [key: string]: number } = {};
      formattedSettlements.forEach(setl => {
        const dateStr = new Date(setl.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        settlementByDate[dateStr] = (settlementByDate[dateStr] || 0) + setl.net_payable;
      });

      const settlementChart = Object.keys(settlementByDate).map(key => ({
        date: key,
        amount: settlementByDate[key]
      })).slice(-10);

      setChartsData({
        milkTrends: milkChart.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        settlementTrends: settlementChart.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session && isSuperAdmin) {
      loadAllData();
    }
  }, [session, isSuperAdmin]);

  // 3. User Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setLoginError(error.message);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to authenticate');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsSuperAdmin(null);
  };

  const handleToggleApproval = async (ownerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: !currentStatus })
        .eq('id', ownerId);

      if (error) throw error;
      
      setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, is_approved: !currentStatus } : o));
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to update owner approval status');
    }
  };

  const handleUpdateSubscription = async (ownerId: string, status: string, expiresAt: string | null, planType?: string) => {
    try {
      const updatePayload: any = { 
        subscription_status: status,
        subscription_expires_at: expiresAt
      };
      if (planType) {
        updatePayload.subscription_plan = planType;
      }
      if (status === 'active') {
        updatePayload.is_approved = true;
      }

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', ownerId);

      if (error) throw error;

      setOwners(prev => prev.map(o => o.id === ownerId ? { 
        ...o, 
        subscription_status: status, 
        subscription_expires_at: expiresAt,
        ...(planType ? { subscription_plan: planType } : {}),
        ...(status === 'active' ? { is_approved: true } : {})
      } : o));
      loadAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to update subscription parameters');
    }
  };

  const handleApproveSubscriptionRequest = async (request: SubscriptionRequestRecord) => {
    try {
      const daysToAdd = request.plan_type === 'annual' ? 365 : request.plan_type === 'half_yearly' ? 180 : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);

      // 1. Activate owner account and subscription in users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_plan: request.plan_type,
          subscription_expires_at: expiryDate.toISOString(),
          is_approved: true
        })
        .eq('id', request.user_id);

      if (userError) throw userError;

      // 2. Mark subscription request as approved
      const { error: reqError } = await supabase
        .from('subscription_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (reqError) console.warn('Could not update request record:', reqError);

      // 3. Log into subscription_payments ledger
      try {
        await supabase
          .from('subscription_payments')
          .insert({
            user_id: request.user_id,
            plan_type: request.plan_type,
            amount: request.amount,
            currency: 'INR',
            razorpay_payment_id: request.payment_reference || null,
            status: 'captured',
            starts_at: new Date().toISOString(),
            expires_at: expiryDate.toISOString(),
            source: 'admin_manual_approval'
          });
      } catch (payInsertErr) {
        console.warn('Could not insert payment audit row:', payInsertErr);
      }

      alert(`Subscription verified & activated for ${request.owner_name} until ${expiryDate.toLocaleDateString()}`);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to approve subscription: ' + (err.message || err));
    }
  };

  const handleRejectSubscriptionRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      alert('Subscription request rejected.');
      loadAllData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to reject subscription: ' + (err.message || err));
    }
  };

  const handleApproveLead = async (lead: ContactRequest) => {
    try {
      if (lead.user_id) {
        const { error: userError } = await supabase
          .from('users')
          .update({ is_approved: true })
          .eq('id', lead.user_id);
        if (userError) throw userError;
      }

      const { error: leadError } = await supabase
        .from('contact_requests')
        .update({ status: 'approved' })
        .eq('id', lead.id);
      if (leadError) throw leadError;

      alert(`Activated owner access for ${lead.name} successfully.`);
      loadAllData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to approve lead: ' + (err.message || err));
    }
  };

  const handleRejectLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: 'rejected' })
        .eq('id', leadId);
      if (error) throw error;

      alert('Lead request marked rejected.');
      loadAllData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to reject lead: ' + (err.message || err));
    }
  };

  // RENDER CONDITIONAL VIEWS
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <span className="text-slate-400 font-sans text-sm tracking-wider font-semibold">Authenticating Session...</span>
      </div>
    );
  }

  // 1. ACCESS DENIED SCREEN (Logged in but not super admin)
  if (session && isSuperAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-sans">Access Denied</h2>
            <p className="text-slate-400 text-sm font-sans leading-relaxed">
              Your account does not possess the permissions required to view the Super Admin control panel.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Logout Account
          </button>
        </div>
      </div>
    );
  }

  // 2. LOGIN VIEW
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-8">
          {/* Logo Title */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
              DairyPro Control Room
            </h1>
            <p className="text-xs text-slate-500 font-sans uppercase tracking-widest font-semibold">
              Super Admin Gateway
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-xs font-sans">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold font-sans">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dairypro.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-sans transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold font-sans">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-12 py-2.5 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-sans transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-500 hover:text-slate-350 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-650/15 flex items-center justify-center gap-2"
            >
              {submittingLogin ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Request Access'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. MAIN DASHBOARD PANELS (Authenticated Admin)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800/80 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight font-sans">
                DairyPro Admin
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold font-sans">
                Control Room
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { 
                id: 'owners', 
                label: 'Dairy Owners', 
                icon: Users,
                badge: stats.pendingOwners > 0 ? stats.pendingOwners : null
              },
              {
                id: 'subscriptions',
                label: 'Subscriptions',
                icon: CreditCard,
                badge: stats.pendingSubscriptionRequests > 0 ? stats.pendingSubscriptionRequests : null
              },
              {
                id: 'leads',
                label: 'Contact Leads',
                icon: Mail,
                badge: stats.pendingLeads > 0 ? stats.pendingLeads : null
              },
              { id: 'sellers', label: 'Suppliers', icon: UserCheck },
              { id: 'settlements', label: 'Settlements', icon: Receipt },
              { id: 'feed', label: 'Cattle Feed', icon: Box },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold font-sans transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/25' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
              {userProfile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-xs block truncate leading-tight font-sans">
                {userProfile?.full_name || 'Admin User'}
              </span>
              <span className="text-[10px] text-slate-500 font-sans block truncate mt-0.5">
                {session.user.email}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadAllData}
              disabled={isRefreshing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-[10px] font-bold transition-all duration-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center p-2 bg-slate-800 hover:bg-rose-600/10 hover:text-rose-400 text-slate-400 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {activeTab === 'dashboard' && (
          <DashboardView stats={stats} chartsData={chartsData} />
        )}
        {activeTab === 'owners' && (
          <OwnersView 
            owners={owners} 
            onToggleApproval={handleToggleApproval} 
            onUpdateSubscription={handleUpdateSubscription} 
          />
        )}
        {activeTab === 'subscriptions' && (
          <SubscriptionsView
            requests={subscriptionRequests}
            payments={subscriptionPayments}
            onApproveRequest={handleApproveSubscriptionRequest}
            onRejectRequest={handleRejectSubscriptionRequest}
          />
        )}
        {activeTab === 'leads' && (
          <LeadsView 
            leads={leads} 
            onApproveLead={handleApproveLead} 
            onRejectLead={handleRejectLead} 
          />
        )}
        {activeTab === 'sellers' && (
          <SellersView sellers={sellers} />
        )}
        {activeTab === 'settlements' && (
          <SettlementsView settlements={settlements} />
        )}
        {activeTab === 'feed' && (
          <CattleFeedView feedSales={feedSales} feedProducts={feedProducts} />
        )}
      </main>
    </div>
  );
}

export default App;