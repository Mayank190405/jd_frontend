import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, Phone, DollarSign, List, 
  Plus, Save, CheckCircle, 
  AlertCircle, Trash2, Home, Bell, Menu, X,
  Calendar, Building, FileText, Clock,
  Settings, Layers, Globe, Printer, UserPlus, CreditCard, Download, Mail, User,
  ChevronDown, MapPin, Grid, Shield, Ruler, CheckSquare, XCircle, Calculator, Table, Filter, Briefcase, ArrowRight, UploadCloud, FileSpreadsheet, Info, MessageSquare, Paperclip, LogOut, Loader,
  Wifi, WifiOff, RefreshCw, Activity, Lock, ShieldCheck, TrendingUp, BellRing, PenTool, Map, File as FileIcon, Camera
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- CONFIGURATION ---
const ENABLE_MOCK_FALLBACK = true; 
const getEnvUrl = () => {
  try {
    if (import.meta.env?.VITE_API_BASE_URL)
      return import.meta.env.VITE_API_BASE_URL;
  } catch (e) {}

  return "http://72.61.244.162";        
};


let API_BASE_URL = getEnvUrl();

// --- CONSTANTS ---
const CONSTANTS = {
    endpoints: {
        importInventory: '/api/inventory/import',
        uploadKYC: '/api/documents/upload/kyc',
        uploadCheque: '/api/documents/upload/cheque'
    },
    unitConfigs: [
      { id: 1, name: "2 BHK Luxury", area: 1250, rate: 6500, total: 8125000 },
      { id: 2, name: "3 BHK Premium", area: 1800, rate: 7000, total: 12600000 },
      { id: 3, name: "1 BHK Compact", area: 650, rate: 6200, total: 4030000 }
    ],
    paymentTemplates: {
      "Construction Linked (CLP)": [
          { milestone: "Booking Amount", percentage: 10 },
          { milestone: "Plinth Completion", percentage: 15 },
          { milestone: "1st Slab", percentage: 10 },
          { milestone: "Brickwork", percentage: 15 },
          { milestone: "Possession", percentage: 50 }
      ],
      "Time Linked (TLP)": [
          { milestone: "Booking", percentage: 10 },
          { milestone: "Within 30 Days", percentage: 20 },
          { milestone: "Within 60 Days", percentage: 20 },
          { milestone: "On Possession", percentage: 50 }
      ]
    },
    taxes: [
      { id: 1, name: "GST", value: "5%" },
      { id: 2, name: "Stamp Duty", value: "7%" },
      { id: 3, name: "Registration", value: "1%" }
    ],
    projectCharges: [
       { name: "Club Membership", amount: 200000 },
       { name: "Legal Fees", amount: 15000 },
       { name: "MSEB & Water", amount: 75000 }
    ],
    sources: ["Meta", "Google", "Broker", "Portal", "Walk-in", "Referral"],
    docTypes: [
      { name: "Agreement to Sale", icon: FileText, type: 'docx' },
      { name: "Cost Sheet", icon: FileSpreadsheet, type: 'csv' },
      { name: "Possession Letter", icon: CheckCircle, type: 'docx' },
      { name: "HDFC Demand Letter", icon: Building, type: 'docx' },
      { name: "SBI NOC/Demand", icon: Building, type: 'docx' },
      { name: "Payment Receipt", icon: DollarSign, type: 'pdf' }
    ]
};

// --- AUTH & STORAGE UTILS ---
const getAuthToken = () => localStorage.getItem('crm_token');
const setAuthToken = (token) => localStorage.setItem('crm_token', token);
const removeAuthToken = () => localStorage.removeItem('crm_token');

const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('crm_user');
        return user ? JSON.parse(user) : null;
    } catch (e) { return null; }
};

const updateConnectionStatus = (isLive) => {
  window.dispatchEvent(new CustomEvent('crm-connection-status', { detail: { isLive } }));
};

// --- MOCK DATA (Fallback only) ---
const MOCK_DB = {
    users: [
        { id: 1, name: "Vikram Malhotra", role: "Manager", active_leads_count: 5, avatar: "V" },
        { id: 2, name: "Arjun (Senior)", role: "Sales Exec", active_leads_count: 42, cap: 50, avatar: "A" },
        { id: 3, name: "Priya (Caller)", role: "Telecaller", active_leads_count: 45, cap: 100, avatar: "P" },
        { id: 4, name: "Rahul (Junior)", role: "Sales Exec", active_leads_count: 28, cap: 35, avatar: "R" },
        { id: 5, name: "Simran (Finance)", role: "Accounts", active_leads_count: 0, cap: 0, avatar: "S" },
    ],
    leads: [
        { id: 101, name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@gmail.com", budget: "1.2 Cr", source: "Meta", status: "NEW", created_at: "2023-11-20", owner: null },
        { id: 102, name: "Sneha Patil", phone: "9988776655", budget: "65 L", source: "Broker", status: "SITE_VISIT", owner: 2, created_at: "2023-11-21" },
        { id: 2, name: "Demo Lead #2", phone: "9988776622", budget: "95 L", source: "Walk-in", status: "NEW", created_at: "2023-11-25", owner: 1 },
        { id: 103, name: "Vikram Singh", phone: "8888888888", budget: "2.5 Cr", source: "Google", status: "NEGOTIATION", owner: 2, created_at: "2023-11-19" },
        { id: 104, name: "Anjali Deshmukh", phone: "7776665555", budget: "85 L", source: "Portal", status: "BOOKED", owner: 1, created_at: "2023-11-15" },
        { id: 105, name: "Mehul Shah", phone: "9991112222", budget: "3 Cr", source: "Referral", status: "IN_PROGRESS", owner: 3, created_at: "2023-11-18" },
        { id: 106, name: "Karan J", phone: "8887776666", budget: "55 L", source: "Walk-in", status: "LOST", owner: 2, created_at: "2023-11-10" },
        { id: 107, name: "Amitabh B", phone: "8899001122", budget: "5 Cr", source: "Referral", status: "SITE_VISIT", owner: 3, created_at: "2023-11-23" }
    ],
    projects: [
        { id: 1, name: "Sunrise Apartments", location: "Nashik", type: "12 Floors • 4 Units/Floor" },
        { id: 2, name: "Green Valley Villas", location: "Pune", type: "1 Floors • 25 Units/Floor" },
        { id: 3, name: "Tech Park Heights", location: "Mumbai", type: "20 Floors • 6 Units/Floor" }
    ],
    towers: [
        { id: 1, name: "Wing A" }, { id: 2, name: "Wing B" }
    ],
    floors: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, number: i + 1, 
        units: Array.from({ length: 4 }, (_, u) => ({
            id: (i + 1) * 100 + u + 1, 
            number: `${i + 1}0${u + 1}`,
            status: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'Sold' : 'Blocked') : 'Available'
        }))
    })),
    bookings: [
        { id: 501, lead_name: "Anjali Deshmukh", lead_id: 104, project_name: "Sunrise Apartments", unit_number: "A-101", deal_amount: 8500000, status: "BOOKED" },
        { id: 502, lead_name: "Mehul Shah", lead_id: 105, project_name: "Tech Park", unit_number: "C-303", deal_amount: 28500000, status: "Pending" }
    ],
    interactions: [
        { id: 1, lead_id: 101, type: 'Note', notes: "Client interested in 3BHK", created_at: "2023-11-20T10:00:00Z", next_followup_date: "2023-11-25" }
    ],
    visits: [
        { id: 1, lead_id: 102, date: "2023-11-25", time: "11:00", type: "Site Visit", status: "Completed" }
    ],
    templates: [
        { id: 1, name: "Agreement to Sale", type: "docx" },
        { id: 2, name: "Cost Sheet", type: "csv" },
        { id: 3, name: "Possession Letter", type: "pdf" },
        { id: 4, name: "HDFC Demand Letter", type: "docx" },
        { id: 5, name: "SBI NOC/Demand", type: "docx" },
        { id: 6, name: "Payment Receipt", type: "pdf" }
    ],
    activity_feed: [
        { id: 1, user: "Vikram", action: "updated a deal for Sunrise Apt", time: "2 hours ago" },
        { id: 2, user: "Arjun", action: "added a note for Rajesh Kumar", time: "3 hours ago" },
        { id: 3, user: "Priya", action: "scheduled a visit for Sneha", time: "5 hours ago" }
    ],
    schedules: {
        501: [
            { milestone: "Booking Token", amount: 500000, status: "Paid", date: "2023-11-20", payer: "Customer" },
            { milestone: "Allotment", amount: 2500000, status: "Pending", date: "2023-12-15", payer: "Customer" },
            { milestone: "Bank Disbursement", amount: 5500000, status: "Pending", date: "2024-01-10", payer: "Bank Loan" }
        ]
    }
};

// --- MOCK HANDLER (Simulates API) ---
const mockBackendHandler = async (endpoint, method, body) => {
    if (!ENABLE_MOCK_FALLBACK) throw new Error("Backend unreachable and Mock disabled.");
    
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency

    // MOCK UPLOADS
    if (endpoint.includes('/upload') || endpoint.includes('/import')) {
        return { success: true, message: "File uploaded successfully (Mock Mode)" };
    }

    // AUTH
    if (endpoint.includes('/auth/login')) {
        let params = {};
        try { params = JSON.parse(body); } catch(e) { params = Object.fromEntries(new URLSearchParams(body)); }
        
        const username = params.username || params.email || params.phone;
        const password = params.password;

        // Simplified mock login (allow any valid looking number/pass for demo)
        if (username && password) {
            return { access_token: "mock-token-xyz", token_type: "bearer", user: { id: 1, name: "Vikram Malhotra", role: "Manager", avatar: "V" }};
        }
        throw new Error("Invalid credentials. Try 9876543210 / password");
    }
    
    if (endpoint.includes('/auth/me')) {
          return { id: 1, name: "Vikram Malhotra", role: "Manager", avatar: "V", email: "admin@realty.com", phone: "9876543210", is_active: true };
    }
    
    // DASHBOARD
    if (endpoint.includes('/dashboard/overview') || endpoint.includes('/dashboard/stats')) {
        return { 
            total_leads: MOCK_DB.leads.length, 
            visits_count: MOCK_DB.visits.length, 
            converted_count: MOCK_DB.bookings.filter(b => b.status === 'BOOKED').length, 
            revenue: MOCK_DB.bookings.filter(b => b.status === 'BOOKED').reduce((a,b) => a + b.deal_amount, 0),
            pipeline_breakdown: [
                { status: 'NEW', count: MOCK_DB.leads.filter(l => l.status === 'NEW').length }, 
                { status: 'SITE_VISIT', count: MOCK_DB.leads.filter(l => l.status === 'SITE_VISIT').length }, 
                { status: 'NEGOTIATION', count: MOCK_DB.leads.filter(l => l.status === 'NEGOTIATION').length }, 
                { status: 'BOOKED', count: MOCK_DB.leads.filter(l => l.status === 'BOOKED').length },
                { status: 'IN_PROGRESS', count: MOCK_DB.leads.filter(l => l.status === 'IN_PROGRESS').length }, 
                { status: 'LOST', count: MOCK_DB.leads.filter(l => l.status === 'LOST').length }
            ],
            recent_leads: MOCK_DB.leads.slice(0, 5),
            recent_activity: MOCK_DB.activity_feed,
            upcoming_visits: [
                { id: 1, client: "Sneha Patil", time: "11:00 AM", project: "Sunrise Apt" },
                { id: 2, client: "Amitabh B", time: "02:30 PM", project: "Green Valley" },
                { id: 3, client: "Rahul Dravid", time: "04:00 PM", project: "Tech Park" }
            ]
        };
    }

    // GENERIC DATA HANDLERS
    if (endpoint === '/api/leads/unassigned') return MOCK_DB.leads.filter(l => !l.owner && !l.owner_id);
    if (endpoint.startsWith('/api/leads')) {
        if (method === 'GET') return MOCK_DB.leads;
        if (method === 'POST') {
            const payload = JSON.parse(body);
            const newLead = { ...payload, id: Date.now(), created_at: new Date().toISOString(), owner: null };
            MOCK_DB.leads.unshift(newLead);
            return newLead;
        }
    }
    
    if (endpoint.match(/\/api\/leads\/\d+\/assign/)) {
        const leadId = parseInt(endpoint.split('/')[3]);
        let assignData;
        try {
            assignData = JSON.parse(body);
        } catch {
            const urlParams = new URLSearchParams(body || '');
            assignData = { user_id: urlParams.get('user_id') };
        }
        
        const userId = parseInt(assignData.user_id);
        const lead = MOCK_DB.leads.find(l => l.id === leadId);
        if (lead) { 
            lead.owner_id = userId;
            lead.owner = userId;
            lead.status = 'IN_PROGRESS'; 
        }
        return { success: true, message: "Lead assigned" };
    }

    if (endpoint.match(/\/api\/leads\/\d+\/status/)) {
        const leadId = parseInt(endpoint.split('/')[3]);
        let statusData;
        try {
            statusData = JSON.parse(body);
        } catch {
            const urlParams = new URLSearchParams(body || '');
            statusData = { status: urlParams.get('status') };
        }
        
        const lead = MOCK_DB.leads.find(l => l.id === leadId);
        if (lead) { 
            lead.status = statusData.status; 
        }
        return { success: true, message: "Status updated" };
    }
    
    if (endpoint.startsWith('/api/users')) return MOCK_DB.users;
    
    if (endpoint === '/api/inventory/projects') return MOCK_DB.projects;
    if (endpoint.match(/\/api\/inventory\/project\/\d+\/towers/)) return MOCK_DB.towers;
    if (endpoint.match(/\/api\/inventory\/tower\/\d+\/floors/)) return MOCK_DB.floors;
    
    // BOOKING ENDPOINTS
    if (endpoint === '/api/booking' && method === 'GET') {
        return MOCK_DB.bookings;
    }
    
    // BOOKING CREATION - FIXED
    if (endpoint === '/api/booking' && method === 'POST') {
        const payload = JSON.parse(body);
        const project = MOCK_DB.projects.find(p => p.id === parseInt(payload.project_id));
        const newBooking = {
            id: Date.now(),
            ...payload,
            status: 'PENDING',
            lead_name: payload.applicant_name || "Unknown Client",
            project_name: project ? project.name : "Project",
            unit_number: payload.unit_number,
            deal_amount: payload.deal_amount,
            base_cost: payload.base_cost || payload.deal_amount * 0.9,
            charges: payload.charges || [],
            schedule: payload.schedule || []
        };
        MOCK_DB.bookings.unshift(newBooking);

        // Update Lead Status to BOOKED
        const lead = MOCK_DB.leads.find(l => l.id === parseInt(payload.lead_id));
        if(lead) { 
            lead.status = 'BOOKED'; 
        }

        // Save Schedule to Mock DB
        if (payload.schedule && Array.isArray(payload.schedule)) {
            MOCK_DB.schedules[newBooking.id] = payload.schedule;
        }

        return { 
            success: true, 
            id: newBooking.id, 
            message: "Booking created",
            booking: {
                id: newBooking.id,
                unit_number: newBooking.unit_number,
                status: newBooking.status
            }
        };
    }

    if (endpoint.match(/\/api\/booking\/\d+\/cancel/)) {
        const bookingId = parseInt(endpoint.split('/')[3]);
        const booking = MOCK_DB.bookings.find(b => b.id === bookingId);
        if (booking) booking.status = 'CANCELLED';
        return { success: true, message: "Booking cancelled" };
    }
    
    if (endpoint.match(/\/api\/booking\/\d+\/confirm/)) {
        const bookingId = parseInt(endpoint.split('/')[3]);
        const booking = MOCK_DB.bookings.find(b => b.id === bookingId);
        if (booking) booking.status = 'BOOKED';
        return { success: true, message: "Booking confirmed" };
    }
    
    if (endpoint.match(/\/api\/booking\/lead\/\d+/)) {
        const leadId = parseInt(endpoint.split('/').pop());
        const booking = MOCK_DB.bookings.find(b => b.lead_id === leadId);
        return booking || {};
    }

    // FINANCE / SCHEDULE ENDPOINTS - FIXED
    if (endpoint.match(/\/api\/finance\/schedule\/\d+$/) && method === 'GET') {
        const bookingId = parseInt(endpoint.split('/').pop());
        if (MOCK_DB.schedules[bookingId]) {
            return {
                schedules: MOCK_DB.schedules[bookingId],
                summary: {
                    total_amount: MOCK_DB.schedules[bookingId].reduce((a, b) => a + b.amount, 0),
                    paid_amount: MOCK_DB.schedules[bookingId].filter(s => s.status === 'Paid').reduce((a, b) => a + b.amount, 0),
                    pending_amount: MOCK_DB.schedules[bookingId].filter(s => s.status === 'Pending').reduce((a, b) => a + b.amount, 0),
                    deal_amount: 5000000
                }
            };
        }
        // Fallback schedule
        return {
            schedules: [
                { id: 1, milestone: "Booking Token", amount: 500000, status: "Paid", due_date: new Date().toISOString(), payer: "Customer" },
                { id: 2, milestone: "Allotment", amount: 2500000, status: "Pending", due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(), payer: "Customer" },
                { id: 3, milestone: "Bank Disbursement", amount: 2000000, status: "Pending", due_date: new Date(Date.now() + 60*24*60*60*1000).toISOString(), payer: "Bank Loan" }
            ],
            summary: {
                total_amount: 5000000,
                paid_amount: 500000,
                pending_amount: 4500000,
                deal_amount: 5000000
            }
        };
    }

    if (endpoint.match(/\/api\/finance\/schedule\/\d+\/pay/) && method === 'POST') {
        const bookingId = parseInt(endpoint.split('/')[4]);
        const milestone = new URLSearchParams(body || '').get('milestone');
        
        if (MOCK_DB.schedules[bookingId]) {
            const item = MOCK_DB.schedules[bookingId].find(i => i.milestone === milestone);
            if (item) item.status = 'Paid';
        }
        return { success: true, status: 'Paid', message: `Payment for ${milestone} marked as paid` };
    }
    
    if (endpoint === '/api/docs/templates') return MOCK_DB.templates;

    if (endpoint.match(/\/api\/interactions\/lead/)) {
        const id = parseInt(endpoint.split('/').pop());
        return MOCK_DB.interactions.filter(i => i.lead_id === id);
    }
    
    if ((endpoint === '/api/api/interactions' || endpoint === '/api/interactions') && method === 'POST') {
        const payload = JSON.parse(body);
        const newInteraction = { 
            ...payload, 
            id: Date.now(), 
            created_at: new Date().toISOString(),
            created_by: 1 
        };
        MOCK_DB.interactions.unshift(newInteraction);
        return { success: true, message: "Interaction created" };
    }

    if (endpoint.match(/\/api\/visits\/lead/)) {
        const id = parseInt(endpoint.split('/').pop());
        return MOCK_DB.visits.filter(v => v.lead_id === id);
    }
    
    if ((endpoint === '/api/api/visits' || endpoint === '/api/visits') && method === 'POST') {
        const payload = JSON.parse(body);
        const newVisit = { 
            ...payload, 
            id: Date.now(), 
            status: 'Scheduled' 
        };
        MOCK_DB.visits.unshift(newVisit);
        return { success: true, message: "Visit scheduled" };
    }

    return { success: true, message: "Mock endpoint executed" };
};

// Generic Fetch Wrapper - FIXED
const fetchAPI = async (endpoint, method = 'GET', body = null, options = {}) => {
  const token = getAuthToken();
  const headers = {};
  
  let requestBody = body;
  let isFormData = false;
  
  if (body && method !== 'GET') {
      if (body instanceof FormData) {
          isFormData = true;
          // Don't set Content-Type for FormData
      } else if (options.contentType === 'application/x-www-form-urlencoded') {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          requestBody = new URLSearchParams(body).toString();
      } else {
          headers['Content-Type'] = 'application/json';
          requestBody = JSON.stringify(body);
      }
  }

  // Add Authorization header if token exists
  if (token && !isFormData) {
      headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const config = { 
      method, 
      headers: isFormData ? {} : headers, // No headers for FormData
      body: requestBody 
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 404 && ENABLE_MOCK_FALLBACK) {
        console.warn(`404 Not Found at ${endpoint}. Switching to Mock Mode.`);
        const mockBody = body ? (body instanceof FormData ? 'form-data' : (typeof body === 'string' ? body : JSON.stringify(body))) : null;
        return await mockBackendHandler(endpoint, method, mockBody);
    }

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('crm-auth-error'));
      throw new Error("Invalid credentials or session expired");
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || errorData.detail || `API Error: ${response.status}`);
    }
    
    updateConnectionStatus(true);
    return await response.json();
    
  } catch (error) {
    if (options.skipMock) { 
      updateConnectionStatus(false); 
      throw error; 
    }
    
    updateConnectionStatus(false);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.warn(`Backend unreachable at ${endpoint}. Switching to Mock Mode.`);
        const mockBody = body ? (body instanceof FormData ? 'form-data' : (typeof body === 'string' ? body : JSON.stringify(body))) : null;
        return await mockBackendHandler(endpoint, method, mockBody);
    }
    
    throw error;
  }
};

// --- SHARED UI COMPONENTS ---
const Card = ({ children, className = "" }) => (<div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200"
  };
  return (<span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.slate}`}>{children}</span>);
};

const Button = ({ children, onClick, type, variant = "primary", className = "", icon: Icon, disabled = false, loading = false }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-transparent",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
  };
  const resolvedType = type || (onClick ? 'button' : 'submit');
  return (
    <button type={resolvedType} onClick={onClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {loading ? <Loader size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const formatCurrency = (val) => {
    if (!val && val !== 0) return '0';
    const num = val.toString().replace(/,/g, '');
    if (isNaN(num)) return val;
    return Number(num).toLocaleString('en-IN');
};

const parseCurrency = (val) => {
    if (!val) return '';
    return val.toString().replace(/,/g, '');
};

// --- LOGIN VIEW ---
const LoginView = ({ onLoginSuccess, isCheckingSession }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    try {
      const data = await fetchAPI('/api/auth/login', 'POST', 
          { username: phone, password }, 
          { contentType: 'application/x-www-form-urlencoded' }
      );
      if (data.access_token) {
        setAuthToken(data.access_token);
        localStorage.setItem('crm_user', JSON.stringify(data.user || { id: 1, name: "User", role: "Manager" }));
        onLoginSuccess(data.user);
      } else { 
        setError("Invalid credentials."); 
      }
    } catch (err) {
      setError(err.message || "Login failed.");
      e.target.password.value = "";
    } finally { 
      setLoading(false); 
    }
  };

  if (isCheckingSession) {
      return (
          <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-8 rounded-full shadow-lg mb-4"><Loader size={32} className="animate-spin text-indigo-600" /></div>
              <div className="text-slate-500 font-medium">Loading session...</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4"><ShieldCheck size={24} /></div>
          <h1 className="text-2xl font-bold text-slate-800">Secure CRM Login</h1>
          <p className="text-slate-500">Authorized Personnel Only</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input name="phone" type="tel" autoComplete="username" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="9876543210" pattern="[0-9]{10}" title="10 digit mobile number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" autoComplete="current-password" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1"><AlertCircle size={16} className="mt-0.5 shrink-0"/> <span>{error}</span></div>}
          <Button className="w-full justify-center" loading={loading}>Secure Sign In</Button>
        </form>
      </Card>
    </div>
  );
};

// --- VIEWS ---

const LeadDistribution = ({ users, showToast, refreshData }) => {
    const [unassignedLeads, setUnassignedLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        loadUnassigned(); 
    }, []);

    const loadUnassigned = async () => {
      try {
        setLoading(true);
        const data = await fetchAPI('/api/leads/unassigned');
        setUnassignedLeads(Array.isArray(data) ? data : []); 
      } catch (e) { 
        console.error(e);
        showToast("Failed to load unassigned leads", "error"); 
      } finally { 
        setLoading(false); 
      }
    };

    const handleAssign = async (leadId, userId) => {
        try {
            await fetchAPI(`/api/leads/${leadId}/assign`, 'POST', { user_id: parseInt(userId) });
            setUnassignedLeads(prev => prev.filter(l => l.id !== leadId));
            showToast(`Lead assigned successfully`);
            refreshData();
        } catch (e) {
            console.error(e);
            showToast("Assignment failed", "error");
        }
    };

    const salesExecs = (users || []).filter(u => u.role === 'Sales Exec' || u.role === 'Manager');

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Lead Distribution Center</h2>
                <div className="text-sm text-slate-500">Pending Allocation: {unassignedLeads.length}</div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                <Card className="flex-1 flex flex-col overflow-hidden bg-slate-50 border-slate-300">
                    <div className="p-4 bg-white border-b flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Layers size={18} className="text-blue-500"/> Unassigned Leads</h3>
                        <Button variant="ghost" onClick={loadUnassigned} icon={Clock} className="text-xs">Refresh</Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? <div className="text-center py-10"><Loader className="animate-spin mx-auto"/></div> : 
                         unassignedLeads.length === 0 ? <div className="text-center py-10 text-slate-400 italic">Queue is empty. Good job!</div> : (
                          unassignedLeads.map(lead => (
                            <div key={lead.id} className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <div><div className="font-bold text-slate-800">{lead.name}</div><div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Globe size={10}/> {lead.source || 'Web'}</div></div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-600">{lead.budget || '--'}</div>
                                        <div className="text-[10px] text-slate-400">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Today'}</div>
                                    </div>
                                </div>
                                <div className="mt-3 pl-2">
                                    <select 
                                        className="w-full mt-1 p-2 text-sm border rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                                        onChange={(e) => handleAssign(lead.id, e.target.value)} 
                                        value=""
                                    >
                                        <option value="" disabled>Assign to...</option>
                                        {salesExecs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )))}
                    </div>
                </Card>
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={18} className="text-indigo-500"/> Team Capacity</h3></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {salesExecs.map(user => {
                            const load = user.cap ? Math.round(((user.active_leads_count || 0) / user.cap) * 100) : 0;
                            const barColor = load > 90 ? "bg-red-500" : load > 70 ? "bg-orange-500" : "bg-green-500";
                            return (
                                <div key={user.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{user.name.charAt(0)}</div><div><div className="font-bold text-slate-800">{user.name}</div><div className="text-xs text-slate-500">{user.role}</div></div></div>
                                        <div className="text-right"><div className="text-xl font-bold text-slate-700">{user.active_leads_count || 0}</div><div className="text-xs text-slate-400">Active Leads</div></div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.min(load, 100)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>Load: {load}%</span>
                                        <span>{user.cap ? user.cap - user.active_leads_count : 0} slots open</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const InventoryMap = ({ showToast }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTower, setSelectedTower] = useState(null);
    const [towers, setTowers] = useState([]); 
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAPI('/api/inventory/projects').then(data => {
            const safeData = Array.isArray(data) ? data : [];
            setProjects(safeData);
            if(safeData.length > 0) setSelectedProject(safeData[0]);
        }).catch(err => showToast("Failed to load projects", "error"));
    }, []);

    useEffect(() => {
        if(!selectedProject) return;
        setLoading(true);
        fetchAPI(`/api/inventory/project/${selectedProject.id}/towers`).then(data => {
            const safeData = Array.isArray(data) ? data : [];
            setTowers(safeData); 
            if(safeData.length > 0) setSelectedTower(safeData[0]);
            else { setSelectedTower(null); setFloors([]); }
        }).catch(err => showToast("Failed to load towers", "error")).finally(() => setLoading(false));
    }, [selectedProject]);

    useEffect(() => {
        if(!selectedTower || !selectedTower.name) return;
        setLoading(true);
        fetchAPI(`/api/inventory/tower/${selectedTower.name}/floors`).then(data => {
            setFloors(Array.isArray(data) ? data : []); 
        }).catch(err => showToast("Failed to load inventory grid", "error")).finally(() => setLoading(false));
    }, [selectedTower]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 overflow-x-auto">
                    {projects.map(p => (
                        <button 
                            key={p.id} 
                            onClick={() => setSelectedProject(p)} 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${selectedProject?.id === p.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border'}`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
                <div className="flex gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded"></div> Available</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-50 border border-rose-200 rounded"></div> Sold</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div> Blocked</span>
                </div>
            </div>
            <Card className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                {loading ? <div className="flex h-full items-center justify-center"><Loader className="animate-spin text-indigo-500"/></div> : (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex bg-white rounded-lg p-1 border shadow-sm">
                                {towers.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => setSelectedTower(t)} 
                                        className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${selectedTower?.id === t.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[...floors].reverse().map(floor => (
                                <div key={floor.id} className="flex gap-2 items-center">
                                    <div className="w-12 text-xs font-bold text-slate-400">Lv {floor.number}</div>
                                    <div className="flex-1 grid grid-cols-4 lg:grid-cols-6 gap-2">
                                        {floor.units && floor.units.map(unit => {
                                             let colorClass = "bg-white border-slate-200 hover:border-indigo-400 text-slate-600";
                                             if(unit.status === 'Sold') colorClass = "bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed";
                                             if(unit.status === 'Blocked') colorClass = "bg-amber-50 border-amber-200 text-amber-500";
                                             if(unit.status === 'Available') colorClass = "bg-emerald-50 border-emerald-200 text-emerald-600 hover:shadow-md cursor-pointer";
                                             return (
                                                <div key={unit.id} className={`border rounded p-2 text-center text-xs transition-all ${colorClass}`}>
                                                    <div className="font-bold">{unit.number}</div>
                                                    <div className="text-[10px] uppercase mt-1">{unit.status}</div>
                                                </div>
                                             );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

const AccountsView = ({ showToast }) => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [scheduleData, setScheduleData] = useState({ schedules: [], summary: {} });
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState('active');

    useEffect(() => {
        fetchAPI('/api/booking').then(data => setBookings(Array.isArray(data) ? data : [])).catch(err => showToast("Failed to fetch bookings", "error"));
    }, []);

    useEffect(() => {
        if(!selectedBooking) return;
        setLoading(true);
        fetchAPI(`/api/finance/schedule/${selectedBooking.id}`).then(data => {
            setScheduleData(data || { schedules: [], summary: {} });
        }).catch(err => {
            console.error(err);
            showToast("Failed to fetch payment schedule", "error");
        }).finally(() => setLoading(false));
    }, [selectedBooking]);

    const handleUpdateStatus = async (status) => {
        if(!selectedBooking) return;
        try {
            if (status === 'CANCELLED') {
                await fetchAPI(`/api/booking/${selectedBooking.id}/cancel`, 'PATCH');
            } else if (status === 'BOOKED') {
                await fetchAPI(`/api/booking/${selectedBooking.id}/confirm`, 'PATCH');
            }
            showToast(`Status updated to ${status}`, "success");
            fetchAPI('/api/booking').then(data => setBookings(Array.isArray(data) ? data : []));
            if(status === 'BOOKED') {
                setTab('closed');
                const updated = bookings.find(b => b.id === selectedBooking.id);
                if(updated) setSelectedBooking({...updated, status: 'BOOKED'});
            }
        } catch (e) {
            console.error(e);
            showToast("Update failed", "error");
        }
    };
    
    const handleMarkPaid = async (milestone) => {
    if(!selectedBooking) return;
    try {
        // Send as query parameters
        await fetchAPI(`/api/finance/schedule/${selectedBooking.id}/pay?milestone=${encodeURIComponent(milestone.milestone)}`, 'POST');
        showToast(`Payment recorded for ${milestone.milestone}`, "success");
        
        // Refresh schedule
        const updatedSchedule = await fetchAPI(`/api/finance/schedule/${selectedBooking.id}`);
        setScheduleData(updatedSchedule);
    } catch (e) {
        console.error(e);
        showToast("Failed to record payment", "error");
    }
};

    const downloadDoc = (docType) => {
        const content = `Document: ${docType}\nClient: ${selectedBooking.lead_name}\nAmount: ${selectedBooking.deal_amount}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedBooking.lead_name}_${docType}.txt`;
        a.click();
        showToast("Document Downloaded");
    };

    const filteredBookings = (bookings || []).filter(b => tab === 'active' ? b.status !== 'BOOKED' : b.status === 'BOOKED');

    const customerShare = (scheduleData.schedules || []).filter(s => s.payer === 'Customer').reduce((a,b) => a + (b.amount || 0), 0);
    const bankLoan = (scheduleData.schedules || []).filter(s => s.payer === 'Bank Loan').reduce((a,b) => a + (b.amount || 0), 0);

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-4 mb-4 border-b pb-2">
                <button onClick={() => { setTab('active'); setSelectedBooking(null); }} className={`pb-2 px-4 font-bold text-sm ${tab === 'active' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-500'}`}>Pending Approval</button>
                <button onClick={() => { setTab('closed'); setSelectedBooking(null); }} className={`pb-2 px-4 font-bold text-sm ${tab === 'closed' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500'}`}>Active Ledgers</button>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                <Card className="w-full lg:w-1/3 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b"><h3 className="font-bold text-slate-700">Client List</h3></div>
                    <div className="overflow-y-auto p-2 space-y-2 flex-1">
                        {filteredBookings.length === 0 && <div className="p-4 text-center text-slate-400">No bookings found.</div>}
                        {filteredBookings.map(b => (
                            <div key={b.id} onClick={() => setSelectedBooking(b)} className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedBooking?.id === b.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                                <div className="font-bold text-slate-800">{b.lead_name || `Booking #${b.id}`}</div>
                                <div className="text-xs text-slate-500">{b.project_name} - {b.unit_number}</div>
                                <div className="text-xs text-right mt-1 font-mono">₹ {formatCurrency(b.deal_amount)}</div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="w-full lg:w-2/3 flex flex-col overflow-hidden">
                    {!selectedBooking ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50"><FileText size={64} /><p>Select a Client</p></div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-6 bg-white border-b flex justify-between items-end">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        {selectedBooking.lead_name}
                                        {tab === 'closed' && <Badge color="green">Ledger Closed</Badge>}
                                    </h2>
                                    <p className="text-sm text-slate-500">{selectedBooking.unit_number} | {selectedBooking.project_name}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase">Deal Value</div>
                                    <div className="text-2xl font-bold">₹ {formatCurrency(selectedBooking.deal_amount)}</div>
                                    {tab === 'closed' && <div className="text-xs text-green-600 font-bold mt-1">Received: ₹ {formatCurrency(scheduleData.summary?.paid_amount || 0)}</div>}
                                </div>
                            </div>
                            
                            {tab === 'closed' && scheduleData.summary?.paid_amount === scheduleData.summary?.total_amount && (
                                <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex gap-4 items-center">
                                    <div className="bg-emerald-200 p-2 rounded-full text-emerald-800"><CheckCircle size={20}/></div>
                                    <div className="flex-1">
                                        <div className="font-bold text-emerald-800">Account Settled</div>
                                        <div className="text-xs text-emerald-600">Full payment received. Account is now closed.</div>
                                    </div>
                                    <Button variant="success" className="text-xs h-8" icon={Download} onClick={() => downloadDoc('All_Docs')}>Download All Documents</Button>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
                                {tab === 'active' && <div className="text-xs font-bold uppercase text-slate-500 mb-2">Booking Verification</div>}
                                
                                {/* Deal Structure & Docs */}
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-white p-4 rounded border">
                                         <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Deal Structure</h4>
                                         <div className="grid grid-cols-2 gap-y-2 text-sm">
                                             <span className="text-slate-500">Client:</span><span className="font-medium text-right">{selectedBooking.lead_name}</span>
                                             <span className="text-slate-500">Project:</span><span className="font-medium text-right">{selectedBooking.project_name}</span>
                                             <span className="text-slate-500">Unit:</span><span className="font-medium text-right">{selectedBooking.unit_number}</span>
                                             <span className="text-slate-500">Value:</span><span className="font-medium text-right">₹ {formatCurrency(selectedBooking.deal_amount)}</span>
                                         </div>
                                     </div>
                                     <div className="bg-white p-4 rounded border">
                                         <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">{tab === 'closed' ? 'Legal Repository' : 'Uploaded Documents'}</h4>
                                         <div className="grid grid-cols-1 gap-2 text-xs">
                                             {tab === 'closed' ? CONSTANTS.docTypes.map(doc => (
                                                 <div key={doc.name} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-slate-50" onClick={() => downloadDoc(doc.name)}>
                                                     <doc.icon size={14} className="text-blue-500"/> <span className="truncate">{doc.name}</span>
                                                 </div>
                                             )) : (
                                                 <>
                                                     <div className="flex items-center gap-2 p-2 border rounded bg-slate-50"><FileIcon size={14} className="text-blue-500"/> KYC_Primary_Applicant.pdf</div>
                                                     <div className="flex items-center gap-2 p-2 border rounded bg-slate-50"><FileIcon size={14} className="text-blue-500"/> Booking_Cheque_Scan.jpg</div>
                                                 </>
                                             )}
                                         </div>
                                     </div>
                                </div>

                                {/* Funding Breakdown */}
                                <div className="bg-white rounded border p-4">
                                    <h4 className="font-bold text-xs uppercase text-slate-400 mb-3">Funding Breakdown</h4>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-blue-50 p-3 rounded border border-blue-100 text-center">
                                            <div className="text-xs text-blue-800 font-bold uppercase">Customer Share</div>
                                            <div className="text-lg font-bold text-blue-900">₹ {formatCurrency(customerShare || 0)}</div>
                                        </div>
                                        <div className="flex-1 bg-purple-50 p-3 rounded border border-purple-100 text-center">
                                            <div className="text-xs text-purple-800 font-bold uppercase">Bank Loan</div>
                                            <div className="text-lg font-bold text-purple-900">₹ {formatCurrency(bankLoan || 0)}</div>
                                        </div>
                                    </div>
                                </div>

                                {loading ? <Loader className="animate-spin mx-auto"/> : (
                                    <div className="bg-white rounded-lg border overflow-hidden">
                                        <div className="p-3 bg-slate-100 font-bold text-slate-700 text-sm flex justify-between"><span>Payment Schedule</span></div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-600 border-b">
                                                <tr>
                                                    <th className="p-3 text-left">Milestone</th>
                                                    <th className="p-3 text-left">Due Date</th>
                                                    <th className="p-3 text-left">Source</th>
                                                    <th className="p-3 text-right">Amount</th>
                                                    <th className="p-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(scheduleData.schedules || []).map((row, idx) => (
                                                    <tr key={idx} className="border-b last:border-0">
                                                        <td className="p-3">{row.milestone}</td>
                                                        <td className="p-3">{row.due_date ? new Date(row.due_date).toLocaleDateString() : '-'}</td>
                                                        <td className="p-3"><Badge color={row.payer === 'Bank Loan' ? 'purple' : 'blue'}>{row.payer || 'Customer'}</Badge></td>
                                                        <td className="p-3 text-right font-mono">₹ {formatCurrency(row.amount)}</td>
                                                        <td className="p-3 flex items-center gap-2">
                                                            <Badge color={row.status === 'Paid' ? 'green' : 'orange'}>{row.status || 'Pending'}</Badge>
                                                            {tab === 'closed' && row.status !== 'Paid' && (
                                                                <button 
                                                                    onClick={() => handleMarkPaid(row)}
                                                                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold border border-indigo-200"
                                                                    title="Mark as Paid"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(scheduleData.schedules || []).length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-400">No schedule defined.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            
                            {tab === 'active' && (
                                <div className="p-4 border-t bg-white flex justify-end gap-2">
                                    <Button variant="danger" onClick={() => handleUpdateStatus('CANCELLED')}>Reject</Button>
                                    <Button variant="success" onClick={() => handleUpdateStatus('BOOKED')}>Approve & Convert</Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// --- SETTINGS VIEW ---
const SettingsView = ({ showToast, onUrlChange }) => {
    const [activeTab, setActiveTab] = useState('Team');
    const [templates, setTemplates] = useState([]);
    const [apiUrl, setApiUrl] = useState(API_BASE_URL);
    const [diagLoading, setDiagLoading] = useState(false);
    const [diagResult, setDiagResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    const [team, setTeam] = useState([]);
    
    useEffect(() => {
        fetchAPI('/api/docs/templates').then(data => setTemplates(Array.isArray(data) ? data : [])).catch(() => {});
        fetchAPI('/api/users').then(data => setTeam(Array.isArray(data) ? data : [])).catch(() => {});
    }, []);

    const handleSaveUrl = () => { 
        API_BASE_URL = apiUrl; 
        onUrlChange(); 
        showToast("API URL Updated"); 
    };
    
    const runDiagnostics = async () => {
        setDiagLoading(true); 
        setDiagResult(null);
        try { 
            await fetchAPI('/health', 'GET', null, { skipMock: true }); 
            setDiagResult({ success: true, message: "Connection Successful!" }); 
        } catch (err) { 
            setDiagResult({ success: false, message: err.toString() }); 
        } finally { 
            setDiagLoading(false); 
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleImportInventory = async () => {
        if (!selectedFile) return showToast("Please select a file first", "error");
        
        setImportLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        try {
            await fetchAPI(CONSTANTS.endpoints.importInventory, 'POST', formData);
            showToast("Inventory Imported Successfully!");
            setSelectedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            showToast("Import failed: " + err.message, "error");
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b pb-1">
                {['Team', 'Inventory', 'Finance', 'Masters', 'Templates', 'System'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === 'Team' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 h-fit"><h3 className="font-bold mb-4">Add Team Member</h3><div className="flex gap-2"><input placeholder="Name" className="flex-1 border p-2 rounded text-sm"/><Button className="h-10">Add</Button></div></Card>
                        <Card className="p-6"><h3 className="font-bold mb-4">Current Team</h3><div className="space-y-2">{(team || []).map(u => (<div key={u.id} className="flex justify-between items-center p-2 border rounded bg-slate-50"><span>{u.name}</span><span className="text-xs bg-slate-200 px-2 py-1 rounded">{u.role}</span></div>))}</div></Card>
                    </div>
                )}

                {activeTab === 'Inventory' && (
                    <div className="space-y-6">
                        <Card className="p-6 border-dashed border-2 border-indigo-200 bg-indigo-50">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2 text-indigo-800"><UploadCloud size={20} /> Bulk Import Inventory</h3>
                                    <p className="text-sm text-indigo-600">Upload an Excel/CSV file to create multiple projects and units instantly.</p>
                                    {selectedFile && <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> Selected: {selectedFile.name}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".csv,.xlsx,.xls"/>
                                    <button className="text-xs text-indigo-600 underline font-medium hover:text-indigo-800 mr-2">Download Template</button>
                                    <Button variant="secondary" onClick={() => fileInputRef.current.click()}>Choose File</Button>
                                    <Button onClick={handleImportInventory} loading={importLoading} disabled={!selectedFile}>Import</Button>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6"><h3 className="font-bold mb-4">Active Projects</h3><div className="space-y-2">{MOCK_DB.projects.map(p => (<div key={p.id} className="p-3 border rounded bg-slate-50 flex justify-between"><span className="font-bold">{p.name}</span><span className="text-sm text-slate-500">{p.type}</span></div>))}</div></Card>
                    </div>
                )}

                {activeTab === 'Finance' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6"><h3 className="font-bold mb-4">Taxes Configuration</h3><div className="space-y-2">{CONSTANTS.taxes.map(t => (<div key={t.id} className="flex justify-between p-3 border rounded bg-white items-center"><span className="text-slate-700">{t.name}</span><span className="font-bold text-slate-900">{t.value}</span></div>))}</div></Card>
                        <Card className="p-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold">Project Charges</h3><select className="text-xs border p-1 rounded"><option>Sunrise Apartments</option></select></div><div className="space-y-2">{CONSTANTS.projectCharges.map((c, i) => (<div key={i} className="flex justify-between p-3 border rounded bg-white items-center"><span className="text-slate-700">{c.name}</span><span className="font-bold text-slate-900">₹ {formatCurrency(c.amount)}</span></div>))}</div></Card>
                    </div>
                )}

                {activeTab === 'Masters' && (
                    <Card className="p-6"><h3 className="font-bold mb-4">Lead Sources</h3><div className="flex flex-wrap gap-2">{CONSTANTS.sources.map(s => (<span key={s} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">{s}</span>))}<button className="px-4 py-2 border border-dashed border-slate-300 text-slate-500 rounded-full text-sm hover:bg-slate-50">+ Add Source</button></div></Card>
                )}

                {activeTab === 'Templates' && (
                      <Card className="p-6"><h3 className="font-bold mb-4">Document Templates</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{(templates || []).map((doc) => (<div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50"><div className="flex items-center gap-3"><div className="bg-slate-100 p-2 rounded text-slate-600"><FileIcon size={20}/></div><div><div className="font-bold text-sm text-slate-800">{doc.name}</div><div className="text-xs text-slate-400 uppercase">.{doc.type || 'docx'} Template</div></div></div><button className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button></div>))}</div></Card>
                )}

                {activeTab === 'System' && (
                    <Card className="p-6 border-indigo-200 bg-indigo-50">
                        <h3 className="font-bold mb-4 text-indigo-900 flex items-center gap-2"><Wifi size={20}/> Backend Configuration</h3>
                        <div className="flex gap-4 items-end mb-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-indigo-700 mb-1 block">API Base URL</label>
                                <input className="w-full border p-2 rounded bg-white text-sm font-mono" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="http://localhost:4000"/>
                            </div>
                            <Button onClick={handleSaveUrl} icon={Save}>Update</Button>
                        </div>
                        <div className="border-t border-indigo-200 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-indigo-800">Connection Diagnostics</span>
                                <Button variant="secondary" className="text-xs" onClick={runDiagnostics} loading={diagLoading} icon={Activity}>Run Diagnostics</Button>
                            </div>
                            {diagResult && <div className={`p-3 rounded-lg text-sm border ${diagResult.success ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}><strong>{diagResult.success ? 'Success:' : 'Error:'}</strong> {diagResult.message}</div>}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

const Customer360Modal = ({ lead, onClose, showToast, refreshData, currentUser }) => {
    const [activeTab, setActiveTab] = useState('timeline');
    const [actionType, setActionType] = useState('Note'); 
    const [bookingData, setBookingData] = useState({ 
        project_id: '', unit_number: '', unit_id: null, deal_amount: '', baseCost: '', configId: '',
        applicant_name: lead.name, applicant_phone: lead.phone, applicant_email: lead.email, applicant_address: '', applicant_pan: '', applicant_aadhar: '', applicant_occupation: '',
        co_applicant_name: '', co_applicant_phone: '', co_applicant_pan: '', co_applicant_aadhar: '',
        tower: '', floor: '', carpetArea: '', rate: '',
        parking_type: 'None', booking_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cheque', payment_bank: '', payment_ref: '', payment_date: new Date().toISOString().split('T')[0],
        booking_amount: '',
        remarks: '', agree_terms: false,
        charges: []
    });
    const [schedule, setSchedule] = useState([]);
    const [newChargeName, setNewChargeName] = useState("");
    const [newChargeAmount, setNewChargeAmount] = useState("");
    const [newChargeType, setNewChargeType] = useState("fixed");
    
    // States
    const [timelineItems, setTimelineItems] = useState([]);
    const [projects, setProjects] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [uploadingDocType, setUploadingDocType] = useState(null);
    const fileInputRef = useRef(null);

    const fetchTimeline = useCallback(async () => {
        try {
            const [interactionsData, visitsData] = await Promise.all([
                fetchAPI(`/api/interactions/lead/${lead.id}`),
                fetchAPI(`/api/visits/lead/${lead.id}`)
            ]);
            const normInteractions = (Array.isArray(interactionsData) ? interactionsData : []).map(i => ({...i, type: 'Note', dateObj: new Date(i.created_at)}));
            const normVisits = (Array.isArray(visitsData) ? visitsData : []).map(v => ({...v, type: 'Visit', dateObj: new Date(`${v.date}T${v.time}`)}));
            let merged = [...normInteractions];
            if (currentUser && ['Manager', 'Sales Exec'].includes(currentUser.role)) { 
                merged = [...merged, ...normVisits]; 
            }
            merged.sort((a,b) => b.dateObj - a.dateObj);
            setTimelineItems(merged);
        } catch (e) { 
            console.error("Timeline Error", e); 
        }
    }, [lead.id, currentUser]);

    // Fix units fetching
    useEffect(() => {
        if (bookingData.floor) {
            const mockUnits = [];
            for (let i = 1; i <= 4; i++) {
                mockUnits.push({
                    id: parseInt(`${bookingData.floor}${i}`),
                    number: `${bookingData.floor}0${i}`,
                    status: 'Available'
                });
            }
            setAvailableUnits(mockUnits);
        } else {
            setAvailableUnits([]);
        }
    }, [bookingData.floor]);

    useEffect(() => {
        fetchTimeline();
        fetchAPI(`/api/booking/lead/${lead.id}`).then(data => { 
            if(data && data.id) {
                setBookingData(prev => ({...prev, ...data, charges: data.charges || []})); 
            }
        }).catch(() => {});
        fetchAPI(`/api/inventory/projects`).then(data => { 
            if(Array.isArray(data)) setProjects(data); 
        }).catch(() => {});
    }, [lead.id, fetchTimeline]);

    const handleStageChange = async (newStage) => {
        try {
            await fetchAPI(`/api/leads/${lead.id}/status`, 'POST', { status: newStage });
            showToast(`Stage updated to ${newStage}`);
            refreshData();
        } catch (e) {
            console.error(e);
            showToast("Failed to update stage", "error");
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (actionType === 'Note') {
            const text = e.target.note.value;
            const followupDate = e.target.next_followup_date.value;
            const followupTime = e.target.next_followup_time.value;
            if (!text) return;
            let nextFollowup = null;
            if (followupDate) { 
                nextFollowup = followupTime ? `${followupDate}T${followupTime}` : followupDate; 
            }
            try { 
                await fetchAPI(`/api/interactions`, 'POST', { lead_id: lead.id, type: 'Note', notes: text, next_followup_date: nextFollowup }); 
                e.target.reset(); 
                fetchTimeline(); 
                showToast("Note added"); 
            } catch (err) { 
                console.error(err);
                showToast("Failed to add note", "error"); 
            }
        } else if (actionType === 'Visit') {
            const fd = new FormData(e.target);
            const visitData = { 
                lead_id: lead.id, 
                date: fd.get('date'), 
                time: fd.get('time'), 
                type: fd.get('type'), 
                notes: fd.get('notes') 
            };
            try { 
                await fetchAPI(`/api/visits`, 'POST', visitData); 
                e.target.reset(); 
                fetchTimeline(); 
                showToast("Visit Scheduled"); 
            } catch (err) { 
                console.error(err);
                showToast("Failed to schedule visit", "error"); 
            }
        }
    };

    const calculateTotal = (base, currentCharges) => {
        const baseVal = parseFloat(base) || 0;
        const chargesVal = currentCharges.reduce((acc, curr) => {
            if (curr.type === 'percent') {
                return acc + (baseVal * (curr.value / 100));
            }
            return acc + (curr.value || 0);
        }, 0);
        return Math.round(baseVal + chargesVal);
    };

    const handleBaseCostChange = (val) => {
        const newBase = parseCurrency(val);
        const newTotal = calculateTotal(newBase, bookingData.charges);
        setBookingData({ ...bookingData, baseCost: newBase, deal_amount: newTotal });
    };

    const handleAddCharge = () => {
        if (!newChargeName || !newChargeAmount) return;
        
        const newCharge = { 
            id: Date.now(), 
            name: newChargeName, 
            type: newChargeType, 
            value: parseFloat(newChargeAmount) 
        };

        const newCharges = [...bookingData.charges, newCharge];
        const newTotal = calculateTotal(bookingData.baseCost, newCharges);
        setBookingData({ ...bookingData, charges: newCharges, deal_amount: newTotal });
        
        setNewChargeName("");
        setNewChargeAmount("");
    };

    const handleRemoveCharge = (id) => {
        const newCharges = bookingData.charges.filter(c => c.id !== id);
        const newTotal = calculateTotal(bookingData.baseCost, newCharges);
        setBookingData({ ...bookingData, charges: newCharges, deal_amount: newTotal });
    };

    const applyPricing = (configId) => {
        const config = CONSTANTS.unitConfigs.find(c => c.id === parseInt(configId));
        if (config) { 
            const newBase = config.total;
            const newTotal = calculateTotal(newBase, bookingData.charges);
            setBookingData(prev => ({ 
                ...prev, 
                configId, 
                carpetArea: config.area, 
                rate: config.rate, 
                baseCost: newBase, 
                deal_amount: newTotal 
            })); 
        }
    };

    const applyTemplate = (tmplName) => {
        const tmpl = CONSTANTS.paymentTemplates[tmplName];
        const total = parseInt(bookingData.deal_amount || 0);
        if(!total) return showToast("Set Deal Amount first", "error");
        const newRows = tmpl.map((step, idx) => ({ 
            id: idx, 
            milestone: step.milestone, 
            amount: Math.round((total * step.percentage) / 100), 
            status: 'Pending', 
            date: '', 
            payer: 'Customer' 
        }));
        setSchedule(newRows);
    };

    const addScheduleRow = () => { 
        setSchedule([...schedule, { 
            id: Date.now(), 
            milestone: "New Milestone", 
            amount: 0, 
            status: 'Pending', 
            date: '', 
            payer: 'Customer' 
        }]); 
    };
    
    const removeScheduleRow = (index) => { 
        const newSchedule = [...schedule]; 
        newSchedule.splice(index, 1); 
        setSchedule(newSchedule); 
    };
    
    const updateScheduleRow = (index, field, value) => { 
        const newSchedule = [...schedule]; 
        newSchedule[index][field] = value; 
        setSchedule(newSchedule); 
    };

    const triggerUpload = (docType) => {
        setUploadingDocType(docType);
        if(fileInputRef.current) fileInputRef.current.click();
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if(!file || !uploadingDocType) return;
        
        const endpoint = uploadingDocType === 'Cheque' ? CONSTANTS.endpoints.uploadCheque : CONSTANTS.endpoints.uploadKYC;
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', uploadingDocType);
        formData.append('lead_id', lead.id);

        try {
            showToast(`Uploading ${uploadingDocType}...`, 'info');
            await fetchAPI(endpoint, 'POST', formData);
            showToast(`${uploadingDocType} uploaded successfully`);
        } catch (err) {
            console.error(err);
            showToast(`Failed to upload ${uploadingDocType}`, 'error');
        } finally {
            setUploadingDocType(null);
            e.target.value = null;
        }
    };

    const handleUnitChange = (e) => {
        const unitNum = e.target.value;
        const unit = availableUnits.find(u => u.number === unitNum);
        setBookingData(prev => ({
            ...prev,
            unit_number: unitNum,
            unit_id: unit ? unit.id : null
        }));
    };

    const handleBookingSubmit = async () => {
        try {
            // Validate required fields
            if (!bookingData.unit_id && !bookingData.unit_number) {
                throw new Error("Please select a unit.");
            }
            if (!bookingData.deal_amount || parseFloat(bookingData.deal_amount) <= 0) {
                throw new Error("Deal amount is required.");
            }
            if (schedule.length === 0) {
                throw new Error("Payment schedule is required.");
            }
            if (!bookingData.agree_terms) {
                throw new Error("You must agree to the terms.");
            }
            
            // Validate schedule total matches deal amount
            const scheduleTotal = schedule.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
            const dealAmount = parseFloat(bookingData.deal_amount);
            if (Math.abs(scheduleTotal - dealAmount) > 1) {
                throw new Error(`Schedule total (${scheduleTotal}) must match deal amount (${dealAmount})`);
            }
            
            // Create booking payload
            const bookingPayload = {
                lead_id: lead.id,
                project_id: parseInt(bookingData.project_id) || 1,
                unit_id: bookingData.unit_id || 101,
                unit_number: bookingData.unit_number || `UNIT-${bookingData.unit_id}`,
                deal_amount: parseFloat(bookingData.deal_amount),
                base_cost: parseFloat(bookingData.baseCost) || parseFloat(bookingData.deal_amount) * 0.9,
                charges: bookingData.charges,
                parking_type: bookingData.parking_type || "None",
                
                // Applicant details
                applicant_name: bookingData.applicant_name || lead.name,
                applicant_phone: bookingData.applicant_phone || lead.phone,
                applicant_email: bookingData.applicant_email || lead.email,
                applicant_pan: bookingData.applicant_pan || "",
                applicant_aadhar: bookingData.applicant_aadhar || "",
                applicant_address: bookingData.applicant_address || "",
                applicant_occupation: bookingData.applicant_occupation || "",
                
                // Co-applicant
                co_applicant_name: bookingData.co_applicant_name || "",
                co_applicant_phone: bookingData.co_applicant_phone || "",
                co_applicant_pan: bookingData.co_applicant_pan || "",
                co_applicant_aadhar: bookingData.co_applicant_aadhar || "",
                
                // Payment details
                payment_mode: bookingData.payment_mode || "Cheque",
                payment_bank: bookingData.payment_bank || "",
                payment_ref: bookingData.payment_ref || "",
                payment_date: bookingData.payment_date || new Date().toISOString(),
                booking_amount: parseFloat(bookingData.booking_amount) || 0,
                
                // Other fields
                remarks: bookingData.remarks || "",
                agree_terms: true
            };
            
            // Send booking data
            const result = await fetchAPI('/api/booking', 'POST', bookingPayload);
            
            if (result.success) {
                showToast("Booking created successfully!");
                onClose();
                refreshData();
            } else {
                throw new Error(result.message || "Booking failed");
            }
        } catch (err) {
            console.error("Booking error:", err);
            showToast(err.message || "Booking failed", "error");
        }
    };

    const nextFollowUp = (timelineItems || []).find(i => i.type === 'Note' && i.next_followup_date && new Date(i.next_followup_date) >= new Date().setHours(0,0,0,0));
    
    const scheduleTotal = (schedule || []).reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
    const customerShare = (schedule || []).filter(s => s.payer === 'Customer').reduce((a,b) => a + (parseFloat(b.amount) || 0), 0);
    const bankLoan = (schedule || []).filter(s => s.payer === 'Bank Loan').reduce((a,b) => a + (parseFloat(b.amount) || 0), 0);
    const isTotalMatching = Math.abs(scheduleTotal - parseFloat(bookingData.deal_amount || 0)) < 1;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <input type="file" ref={fileInputRef} onChange={handleDocUpload} className="hidden" />

        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold">{lead.name}</h3>
                    <select 
                        className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 text-xs font-bold uppercase cursor-pointer hover:bg-slate-700 outline-none" 
                        value={lead.status} 
                        onChange={(e) => handleStageChange(e.target.value)}
                    >
                        {['NEW', 'IN_PROGRESS', 'SITE_VISIT', 'NEGOTIATION', 'BOOKED', 'LOST'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="text-slate-400 text-sm flex gap-6 mt-2">
                    <span className="flex items-center gap-1"><Phone size={14}/> {lead.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={14}/> {lead.email || "No Email"}</span>
                </div>
            </div>
            <button onClick={onClose} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X size={20}/></button>
          </div>
          
          {nextFollowUp && (
            <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-between text-amber-800 text-sm px-6">
                <div className="flex items-center gap-2">
                    <BellRing size={16} className="animate-pulse"/> 
                    <strong>Upcoming Follow-up:</strong> {new Date(nextFollowUp.next_followup_date).toLocaleString()}
                </div>
            </div>
          )}

          <div className="flex border-b bg-slate-50 px-6">
            {['Timeline', 'Booking'].map(tab => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab.toLowerCase())} 
                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    {tab}
                </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-hidden bg-slate-50/50 p-6 overflow-y-auto">
            {activeTab === 'timeline' && (
              <div className="h-full flex flex-col gap-4">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b bg-slate-50">
                        <button onClick={() => setActionType('Note')} className={`flex-1 py-2 text-xs font-bold ${actionType === 'Note' ? 'text-indigo-600 bg-white border-t-2 border-indigo-600' : 'text-slate-500'}`}>Log Note</button>
                        <button onClick={() => setActionType('Visit')} className={`flex-1 py-2 text-xs font-bold ${actionType === 'Visit' ? 'text-indigo-600 bg-white border-t-2 border-indigo-600' : 'text-slate-500'}`}>Schedule Visit</button>
                    </div>
                    <div className="p-3">
                        <form onSubmit={handleAddActivity} className="flex flex-col gap-3">
                            {actionType === 'Note' ? (
                                <>
                                    <textarea name="note" className="w-full border p-2 rounded text-sm outline-none resize-none bg-slate-50 focus:bg-white transition-colors" rows="2" placeholder="Add a follow-up note, call log, or meeting summary..." autoComplete="off"/>
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium w-full sm:w-auto">
                                            <label>Next Follow Up:</label>
                                            <input type="date" name="next_followup_date" className="border p-1 rounded bg-slate-50"/>
                                            <input type="time" name="next_followup_time" className="border p-1 rounded bg-slate-50"/>
                                        </div>
                                        <Button className="h-8 text-xs w-full sm:w-auto">Post Note</Button>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs font-bold text-slate-500">Date</label><input type="date" name="date" required className="w-full p-2 rounded border text-xs"/></div>
                                    <div><label className="text-xs font-bold text-slate-500">Time</label><input type="time" name="time" required className="w-full p-2 rounded border text-xs"/></div>
                                    <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Type</label><select name="type" className="w-full p-2 rounded border text-xs"><option>Site Visit</option><option>Home Visit</option><option>Office Meeting</option></select></div>
                                    <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Notes</label><input name="notes" placeholder="e.g. Bringing parents..." className="w-full p-2 rounded border text-xs"/></div>
                                    <div className="col-span-2 text-right"><Button className="h-8 text-xs w-full">Schedule Visit</Button></div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                  {(timelineItems || []).map((item) => (
                      <div key={`${item.type}-${item.id}`} className={`p-4 rounded-lg border shadow-sm relative ${item.type === 'Visit' ? 'bg-purple-50 border-purple-100' : 'bg-white border-slate-200'}`}>
                          <div className="absolute top-4 right-4 text-xs text-slate-400">{item.dateObj ? item.dateObj.toLocaleString() : 'Unknown date'}</div>
                          <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${item.type === 'Visit' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {item.type === 'Visit' ? <Map size={16}/> : <PenTool size={16}/>}
                              </div>
                              <div className="flex-1">
                                  <div className="text-sm font-bold text-slate-800 mb-1">{item.type === 'Visit' ? 'Site Visit Scheduled' : 'Note Added'}</div>
                                  <div className="text-slate-600 text-sm">{item.notes || `Scheduled visit at ${item.time}`}</div>
                                  {item.next_followup_date && (
                                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                                          <Bell size={10}/> Follow Up: {new Date(item.next_followup_date).toLocaleString()}
                                      </div>
                                  )}
                                  {item.type === 'Visit' && <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-700 font-bold uppercase tracking-wide">Status: {item.status}</div>}
                              </div>
                          </div>
                      </div>
                  ))}
                  {(timelineItems || []).length === 0 && <div className="text-center text-slate-400 mt-10 italic">No history found. Start the conversation!</div>}
                </div>
              </div>
            )}
            
            {activeTab === 'booking' && (
                <div>
                    {bookingData.id ? (
                        <div className="text-center p-10">
                            <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
                            <h2 className="text-2xl font-bold text-green-800">Booking #{bookingData.id} Confirmed</h2>
                            <p className="text-slate-600 mt-2">Deal Amount: ₹ {formatCurrency(bookingData.deal_amount)}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* 1. INVENTORY SELECTION & COSTING */}
                            <Card className="p-6">
                                <h3 className="font-bold mb-4 text-slate-700 border-b pb-2 uppercase tracking-wide text-xs">1. Inventory Selection & Costing</h3>
                                
                                {/* Location & Unit Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Project</label>
                                        <select 
                                            className="w-full border p-2 rounded bg-white" 
                                            value={bookingData.project_id} 
                                            onChange={(e) => setBookingData({...bookingData, project_id: e.target.value})}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Tower</label>
                                        <select 
                                            className="w-full border p-2 rounded bg-white" 
                                            onChange={(e) => setBookingData({...bookingData, tower: e.target.value})}
                                        >
                                            <option value="">Select Tower</option>
                                            <option value="Wing A">Wing A</option>
                                            <option value="Wing B">Wing B</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Floor</label>
                                        <select 
                                            className="w-full border p-2 rounded bg-white" 
                                            onChange={(e) => setBookingData({...bookingData, floor: e.target.value})}
                                        >
                                            <option value="">Any Floor</option>
                                            {[1,2,3,4,5].map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Unit No</label>
                                        <select 
                                            className="w-full border p-2 rounded bg-white font-bold text-indigo-900" 
                                            value={bookingData.unit_number} 
                                            onChange={handleUnitChange}
                                        >
                                            <option value="">Select Unit</option>
                                            {availableUnits.length > 0 ? (
                                                availableUnits.map(u => (
                                                    <option key={u.id} value={u.number}>{u.number}</option>
                                                ))
                                            ) : (
                                                <option disabled>No units available</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* Configuration & Rates */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Configuration</label>
                                        <select className="w-full border p-2 rounded bg-white" onChange={(e) => applyPricing(e.target.value)}>
                                            <option value="">Select Type...</option>
                                            {CONSTANTS.unitConfigs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold text-slate-500">Carpet Area (sqft)</label><input className="w-full border p-2 rounded bg-slate-100 text-slate-500" value={bookingData.carpetArea} readOnly/></div>
                                    <div><label className="text-xs font-bold text-slate-500">Rate / sqft</label><input className="w-full border p-2 rounded" value={bookingData.rate} onChange={e => setBookingData({...bookingData, rate: e.target.value})}/></div>
                                </div>

                                {/* Cost Breakdown Summary */}
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-3 text-sm">
                                    <div className="flex justify-between items-center pb-2 border-b border-indigo-200">
                                        <span className="text-slate-700 font-bold">Base Cost</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-bold">₹</span>
                                            <input 
                                                className="bg-white border border-indigo-200 rounded px-2 py-1 text-right w-32 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                                value={formatCurrency(bookingData.baseCost)} 
                                                onChange={e => handleBaseCostChange(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    {bookingData.charges.map((charge) => {
                                        const amount = charge.type === 'percent' 
                                            ? (parseFloat(bookingData.baseCost || 0) * charge.value / 100) 
                                            : charge.value;
                                        return (
                                            <div key={charge.id} className="flex justify-between items-center text-slate-600 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleRemoveCharge(charge.id)} className="text-red-400 hover:text-red-600"><X size={12}/></button>
                                                    <span>{charge.name} {charge.type === 'percent' && `(${charge.value}%)`}</span>
                                                </div>
                                                <span>₹ {formatCurrency(Math.round(amount))}</span>
                                            </div>
                                        );
                                    })}

                                    {/* Add Manual Charge Controls */}
                                    <div className="flex gap-2 pt-2 items-center">
                                        <input 
                                            className="flex-1 text-xs border border-slate-300 rounded p-1.5 bg-white"
                                            placeholder="Charge Name (e.g. GST)"
                                            value={newChargeName}
                                            onChange={(e) => setNewChargeName(e.target.value)}
                                        />
                                        <select 
                                            className="w-20 text-xs border border-slate-300 rounded p-1.5 bg-white font-bold text-slate-600"
                                            value={newChargeType}
                                            onChange={(e) => setNewChargeType(e.target.value)}
                                        >
                                            <option value="fixed">₹</option>
                                            <option value="percent">%</option>
                                        </select>
                                        <input 
                                            className="w-24 text-xs border border-slate-300 rounded p-1.5 bg-white text-right"
                                            placeholder="Value"
                                            type="number"
                                            value={newChargeAmount}
                                            onChange={(e) => setNewChargeAmount(e.target.value)}
                                        />
                                        <Button 
                                            variant="secondary" 
                                            className="h-8 text-xs px-3" 
                                            onClick={handleAddCharge}
                                            disabled={!newChargeName || !newChargeAmount}
                                        >
                                            Add
                                        </Button>
                                    </div>

                                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-indigo-200 text-indigo-900">
                                        <span>Grand Total Deal Value</span>
                                        <span>₹ {formatCurrency(bookingData.deal_amount || 0)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Parking Allocation</label>
                                        <select 
                                            className="w-full border p-2 rounded bg-white" 
                                            value={bookingData.parking_type} 
                                            onChange={e => setBookingData({...bookingData, parking_type: e.target.value})}
                                        >
                                            <option value="None">None</option>
                                            <option value="1 Covered">1 Covered</option>
                                            <option value="2 Covered">2 Covered</option>
                                            <option value="Open">Open</option>
                                        </select>
                                    </div>
                                </div>
                            </Card>

                            {/* 2. FUNDING BREAKDOWN */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border border-slate-200 p-4 rounded-lg text-center shadow-sm">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Share</div>
                                    <div className="text-xl font-bold text-slate-800">₹ {formatCurrency(customerShare)}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Self Funding</div>
                                </div>
                                <div className="bg-white border border-slate-200 p-4 rounded-lg text-center shadow-sm">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Loan</div>
                                    <div className="text-xl font-bold text-slate-800">₹ {formatCurrency(bankLoan)}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">To be Disbursed</div>
                                </div>
                            </div>

                            {/* 3. APPLICANT DETAILS */}
                            <Card className="p-6">
                                <h3 className="font-bold mb-4 text-slate-700 border-b pb-2 uppercase tracking-wide text-xs">2. Applicant Details</h3>
                                
                                {/* Primary Applicant */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-indigo-600 mb-3 uppercase">Primary Applicant</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                         <div><label className="text-xs font-bold text-slate-500">Name</label><input className="w-full border p-2 rounded bg-slate-50" value={bookingData.applicant_name} readOnly/></div>
                                         <div><label className="text-xs font-bold text-slate-500">Phone</label><input className="w-full border p-2 rounded bg-slate-50" value={bookingData.applicant_phone} readOnly/></div>
                                         <div><label className="text-xs font-bold text-slate-500">Email</label><input className="w-full border p-2 rounded bg-slate-50" value={bookingData.applicant_email} readOnly/></div>
                                         <div><label className="text-xs font-bold text-slate-500">PAN Number</label><input className="w-full border p-2 rounded" placeholder="ABCDE1234F" value={bookingData.applicant_pan} onChange={e=>setBookingData({...bookingData, applicant_pan: e.target.value})}/></div>
                                         <div><label className="text-xs font-bold text-slate-500">Aadhar Number</label><input className="w-full border p-2 rounded" placeholder="1234 5678 9012" value={bookingData.applicant_aadhar} onChange={e=>setBookingData({...bookingData, applicant_aadhar: e.target.value})}/></div>
                                         <div><label className="text-xs font-bold text-slate-500">Occupation</label><input className="w-full border p-2 rounded" placeholder="Service/Business" value={bookingData.applicant_occupation} onChange={e=>setBookingData({...bookingData, applicant_occupation: e.target.value})}/></div>
                                         <div className="col-span-3"><label className="text-xs font-bold text-slate-500">Address</label><input className="w-full border p-2 rounded" placeholder="Full Residential Address" value={bookingData.applicant_address} onChange={e=>setBookingData({...bookingData, applicant_address: e.target.value})}/></div>
                                         
                                         <div className="col-span-3 flex gap-4 mt-2">
                                              <button type="button" onClick={() => triggerUpload('Aadhar')} disabled={uploadingDocType === 'Aadhar'} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                                                 {uploadingDocType === 'Aadhar' ? <Loader size={14} className="animate-spin"/> : <Camera size={14}/>} 
                                                 Upload Aadhar
                                              </button>
                                              <button type="button" onClick={() => triggerUpload('PAN')} disabled={uploadingDocType === 'PAN'} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                                                 {uploadingDocType === 'PAN' ? <Loader size={14} className="animate-spin"/> : <Camera size={14}/>}
                                                 Upload PAN
                                              </button>
                                         </div>
                                    </div>
                                </div>

                                {/* Co-Applicant */}
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-600 mb-3 uppercase">Co-Applicant (Optional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                         <div><label className="text-xs font-bold text-slate-500">Name</label><input className="w-full border p-2 rounded" value={bookingData.co_applicant_name} onChange={e=>setBookingData({...bookingData, co_applicant_name: e.target.value})}/></div>
                                         <div><label className="text-xs font-bold text-slate-500">Phone</label><input className="w-full border p-2 rounded" value={bookingData.co_applicant_phone} onChange={e=>setBookingData({...bookingData, co_applicant_phone: e.target.value})}/></div>
                                         <div><label className="text-xs font-bold text-slate-500">PAN Number</label><input className="w-full border p-2 rounded" value={bookingData.co_applicant_pan} onChange={e=>setBookingData({...bookingData, co_applicant_pan: e.target.value})}/></div>
                                         <div><label className="text-xs font-bold text-slate-500">Aadhar Number</label><input className="w-full border p-2 rounded" value={bookingData.co_applicant_aadhar} onChange={e=>setBookingData({...bookingData, co_applicant_aadhar: e.target.value})}/></div>
                                         
                                         <div className="col-span-4 flex gap-4 mt-2">
                                              <button type="button" onClick={() => triggerUpload('Co_Aadhar')} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-100"><Camera size={14}/> Upload Aadhar</button>
                                              <button type="button" onClick={() => triggerUpload('Co_PAN')} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-100"><Camera size={14}/> Upload PAN</button>
                                         </div>
                                    </div>
                                </div>
                            </Card>

                            {/* 4. PAYMENT & SCHEDULE */}
                            <Card className="p-6">
                                <h3 className="font-bold mb-4 text-slate-700 border-b pb-2 uppercase tracking-wide text-xs">3. Payment & Schedule</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    {/* Payment Instrument Details */}
                                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                        <div className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Booking Amount Details</div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500">Payment Mode</label>
                                            <select className="w-full border p-2 rounded bg-white text-sm" value={bookingData.payment_mode} onChange={e=>setBookingData({...bookingData, payment_mode: e.target.value})}>
                                                <option value="Cheque">Cheque</option>
                                                <option value="RTGS/NEFT">RTGS/NEFT</option>
                                                <option value="UPI">UPI</option>
                                                <option value="DD">DD</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500">Date</label>
                                            <input type="date" className="w-full border p-2 rounded text-sm" value={bookingData.payment_date} onChange={e=>setBookingData({...bookingData, payment_date: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500">Bank Name</label>
                                            <input className="w-full border p-2 rounded text-sm" placeholder="e.g. HDFC Bank" value={bookingData.payment_bank} onChange={e=>setBookingData({...bookingData, payment_bank: e.target.value})}/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500">{bookingData.payment_mode === 'UPI' ? 'Transaction ID' : 'Cheque/Ref No'}</label>
                                            <input className="w-full border p-2 rounded text-sm" placeholder="123456" value={bookingData.payment_ref} onChange={e=>setBookingData({...bookingData, payment_ref: e.target.value})}/>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500">Booking Amount Received (₹)</label>
                                            <input 
                                                className="w-full border p-2 rounded font-bold text-indigo-900 bg-white"
                                                placeholder="Enter Amount" 
                                                value={formatCurrency(bookingData.booking_amount)} 
                                                onChange={e=>setBookingData({...bookingData, booking_amount: parseCurrency(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    {/* Upload Area */}
                                    <div 
                                        className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors flex flex-col items-center justify-center h-full"
                                        onClick={() => triggerUpload('Cheque')}
                                    >
                                        {uploadingDocType === 'Cheque' ? (
                                            <Loader className="text-indigo-500 mb-2 animate-spin" />
                                        ) : (
                                            <UploadCloud className="text-slate-400 mb-2" size={32} />
                                        )}
                                        <p className="text-sm font-medium text-slate-600">Upload Instrument</p>
                                        <p className="text-xs text-slate-400">Scan or Photo</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-700 text-sm">Payment Milestones</h3>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="text-xs h-7" onClick={addScheduleRow}>+ Add Stage</Button>
                                        <Button variant="secondary" className="text-xs h-7" onClick={() => applyTemplate('Construction Linked (CLP)')}>Apply CLP</Button>
                                        <Button variant="secondary" className="text-xs h-7" onClick={() => applyTemplate('Time Linked (TLP)')}>Apply TLP</Button>
                                    </div>
                                </div>
                                
                                <div className="border rounded overflow-hidden mb-6">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="p-2 text-left">Milestone</th>
                                                <th className="p-2 text-left">Due Date</th>
                                                <th className="p-2 text-left">Source</th>
                                                <th className="p-2 text-right">Amount</th>
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(schedule || []).map((row, idx) => (
                                                <tr key={row.id || idx} className="border-t">
                                                    <td className="p-2">
                                                        <input className="w-full border p-1 rounded" value={row.milestone} onChange={(e) => updateScheduleRow(idx, 'milestone', e.target.value)} />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="date" className="w-full border p-1 rounded" value={row.date || ''} onChange={(e) => updateScheduleRow(idx, 'date', e.target.value)} />
                                                    </td>
                                                    <td className="p-2">
                                                        <select 
                                                            className="w-full border p-1 rounded" 
                                                            value={row.payer || 'Customer'} 
                                                            onChange={(e) => updateScheduleRow(idx, 'payer', e.target.value)}
                                                        >
                                                            <option value="Customer">Customer</option>
                                                            <option value="Bank Loan">Bank Loan</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input className="w-full border p-1 rounded text-right" value={formatCurrency(row.amount)} onChange={(e) => updateScheduleRow(idx, 'amount', parseCurrency(e.target.value))} />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button className="text-red-400 hover:text-red-600" onClick={() => removeScheduleRow(idx)}><Trash2 size={14}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(schedule || []).length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-400">Add stages manually or apply a template.</td></tr>}
                                            {schedule.length > 0 && (
                                                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                                    <td colSpan="3" className="p-2 text-right text-slate-600">Schedule Total:</td>
                                                    <td className={`p-2 text-right ${isTotalMatching ? 'text-green-600' : 'text-red-600'}`}>₹ {formatCurrency(scheduleTotal)}</td>
                                                    <td></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Remarks & Terms */}
                                <div className="border-t border-slate-200 pt-4">
                                     <label className="text-xs font-bold text-slate-500 mb-1 block">Remarks / Special Conditions</label>
                                     <textarea className="w-full border p-2 rounded text-sm mb-4 bg-slate-50" rows="2" placeholder="e.g. Subject to loan approval, Parking 101 allocated..." value={bookingData.remarks} onChange={e=>setBookingData({...bookingData, remarks: e.target.value})}></textarea>
                                     
                                     <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-100">
                                        <input type="checkbox" id="terms" className="mt-1 w-4 h-4 text-indigo-600 rounded cursor-pointer" checked={bookingData.agree_terms} onChange={e=>setBookingData({...bookingData, agree_terms: e.target.checked})}/>
                                        <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer select-none">
                                            I confirm that the details above are verified, the booking amount has been received, and the customer has agreed to the project terms.
                                        </label>
                                     </div>
                                </div>
                            </Card>
                            
                            <Button 
                                className="w-full py-3 text-lg" 
                                onClick={handleBookingSubmit} 
                                disabled={!bookingData.deal_amount || schedule.length === 0 || !bookingData.agree_terms || !isTotalMatching}
                            >
                                Confirm Booking
                            </Button>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default function App() {
  const [token, setToken] = useState(getAuthToken());
  const [currentUser, setCurrentUser] = useState(getUserFromStorage());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSessionChecking, setIsSessionChecking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [notification, setNotification] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = 'success') => { 
      setNotification({ msg, type }); 
      setTimeout(() => setNotification(null), 3000); 
  };

  const handleLogout = useCallback(() => { 
      removeAuthToken(); 
      localStorage.removeItem('crm_user'); 
      setToken(null); 
      setCurrentUser(null); 
      setIsSessionChecking(false); 
  }, []);

  useEffect(() => {
    const handleStatus = (e) => setIsBackendLive(e.detail.isLive);
    const handleAuthError = () => handleLogout();
    window.addEventListener('crm-connection-status', handleStatus);
    window.addEventListener('crm-auth-error', handleAuthError);
    return () => { 
        window.removeEventListener('crm-connection-status', handleStatus); 
        window.removeEventListener('crm-auth-error', handleAuthError); 
    };
  }, [handleLogout]);

  const refreshData = useCallback(async () => {
      if(!token) { 
          setIsSessionChecking(false); 
          return; 
      }
      
      setLoading(true);
      
      try {
          const results = await Promise.allSettled([
              fetchAPI('/api/users'),
              fetchAPI('/api/leads'),
              fetchAPI('/api/dashboard/stats')
          ]);
          
          const usersResult = results[0];
          const leadsResult = results[1];
          const statsResult = results[2];
          
          setUsers(usersResult.status === 'fulfilled' ? usersResult.value : []);
          setLeads(leadsResult.status === 'fulfilled' ? leadsResult.value : []);
          
          if (statsResult.status === 'fulfilled') {
              setStats(statsResult.value);
          } else {
              setStats({ 
                  total_leads: 0, 
                  visits_count: 0, 
                  converted_count: 0, 
                  revenue: 0, 
                  pipeline_breakdown: [], 
                  recent_activity: [],
                  recent_leads: [],
                  upcoming_visits: []
              });
          }
          
      } catch (err) { 
          console.error("Session/Data Error", err); 
      } finally { 
          setLoading(false); 
          setIsSessionChecking(false); 
      }
  }, [token]);

  const checkBackendHealth = async () => {
      setIsChecking(true);
      try { 
          await fetchAPI('/health', 'GET', null, { skipMock: true }); 
          showToast("Backend is Online!", "success"); 
          refreshData(); 
      } catch (e) { 
          showToast("Backend Unreachable", "error"); 
      } finally { 
          setIsChecking(false); 
      }
  };

  useEffect(() => { 
      if (token) {
          refreshData();
      }
  }, [token, refreshData]);

  const handleAddLead = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const source = fd.get('source');
    const projectId = fd.get('project_id');
    
    if (!source) return showToast("Please select a lead source", "error");
    
    const payload = { 
        name: fd.get('name'), 
        phone: fd.get('phone'), 
        email: fd.get('email'), 
        budget: fd.get('budget') || null, // Added budget back
        source: source, 
        status: 'NEW',
        project_id: projectId ? parseInt(projectId) : null, // Added project_id
        owner_id: null
    };

    try {
        await fetchAPI('/api/leads', 'POST', payload);
        setIsAddModalOpen(false);
        showToast("Lead Created");
        refreshData();
    } catch (err) { 
        showToast(err.message || "Failed to create lead", "error"); 
    }
};

  if (!token) { 
      return (
          <LoginView 
              isCheckingSession={isSessionChecking} 
              onLoginSuccess={(user) => { 
                  setCurrentUser(user); 
                  setToken(getAuthToken()); 
                  setIsSessionChecking(false); 
              }} 
          />
      ); 
  }

  const DashboardHome = () => {
    if(loading && !stats) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto"/></div>;
    const data = stats || { 
        total_leads: 0, 
        visits_count: 0, 
        converted_count: 0, 
        revenue: 0, 
        pipeline_breakdown: [], 
        recent_activity: [], 
        recent_leads: [], 
        upcoming_visits: [] 
    };
    
    const kpi = [
        { label: "Total Leads", val: data.total_leads || 0, icon: Users, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Site Visits", val: data.visits_count || 0, icon: MapPin, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Closures", val: data.converted_count || 0, icon: CheckCircle, bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
        { label: "Revenue", val: `₹ ${formatCurrency(data.revenue || 0)}`, icon: DollarSign, bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    ];
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpi.map((s, i) => (
                <Card key={i} className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{s.label}</div>
                        <div className="text-2xl font-bold text-slate-800">{s.val}</div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bgColor} ${s.iconColor}`}>
                        <s.icon size={24}/>
                    </div>
                </Card>
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={20}/> Pipeline Health</h3>
                <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.pipeline_breakdown || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="status" tick={{fontSize: 10}} interval={0}/>
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <div className="space-y-6">
                 {/* Recent Activity Feed */}
                <Card className="p-0 overflow-hidden h-full">
                    <div className="p-4 bg-slate-50 border-b font-bold text-slate-700">Recent Activity</div>
                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                        {(data.recent_activity || []).length > 0 ? (data.recent_activity || []).map((act) => (
                             <div key={act.id} className="p-3 flex gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">{act.user ? act.user.charAt(0) : 'S'}</div>
                                 <div>
                                     <div className="text-sm text-slate-800"><span className="font-bold">{act.user}</span> {act.action}</div>
                                     <div className="text-xs text-slate-400">{act.time}</div>
                                 </div>
                             </div>
                        )) : <div className="p-4 text-center text-slate-400 text-sm">No recent activity.</div>}
                    </div>
                </Card>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-30 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col justify-center h-20">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white"><Building size={24} className="text-indigo-400"/> PROPER CRM</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">ENTERPRISE V2.1</div>
            <button className="md:hidden absolute right-4 top-6 text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
        </div>
        <div className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className={`mx-4 mb-4 px-3 py-2 rounded-lg text-xs font-bold flex justify-between items-center ${isBackendLive ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-orange-900/50 text-orange-400 border border-orange-800'}`}>
              <div className="flex items-center gap-2">
                  {isBackendLive ? <Wifi size={14}/> : <WifiOff size={14}/>}
                  {isBackendLive ? 'Live' : 'Mock Mode'}
              </div>
              <button 
                  onClick={checkBackendHealth} 
                  className={`p-1 rounded hover:bg-white/10 ${isChecking ? 'animate-spin' : ''}`} 
                  title="Retry Connection"
                  disabled={isChecking}
              >
                  <RefreshCw size={14}/>
              </button>
          </div>
          
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">Main Menu</div>
          
          {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' }, 
              { id: 'inventory', icon: Grid, label: 'Inventory Map' }, 
              { id: 'pipeline', icon: List, label: 'Sales Pipeline' }, 
              { id: 'accounts', icon: DollarSign, label: 'Finance & Ledger' }
          ].map(item => (
              <button 
                  key={item.id} 
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
              </button>
          ))}
          
          <button 
              onClick={() => { setActiveTab('lead_distribution'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'lead_distribution' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
              <Briefcase size={20} />
              <span className="font-medium">Lead Distribution</span>
          </button>
          
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">System</div>
          
          <button 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
              <Settings size={20} /> 
              <span className="font-medium">Settings</span>
          </button>
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                    {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-sm font-bold">{currentUser?.name || 'User'}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white">
                <LogOut size={18}/>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b flex justify-between items-center px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24}/>
                </button>
                <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')}</h1>
            </div>
            <div className="flex items-center gap-3">
                <Button onClick={() => setIsAddModalOpen(true)} icon={Plus}>Add New Lead</Button>
            </div>
        </header>
        
        <main className="flex-1 overflow-hidden p-6 bg-slate-50/50">
            {loading && !stats ? (
                <div className="flex h-full items-center justify-center">
                    <Loader className="animate-spin text-indigo-600" size={40}/>
                </div>
            ) : (
                <>
                    {activeTab === 'dashboard' && <DashboardHome />}
                    {activeTab === 'inventory' && <InventoryMap showToast={showToast}/>}
                    {activeTab === 'lead_distribution' && <LeadDistribution users={users} showToast={showToast} refreshData={refreshData} />}
                    {activeTab === 'accounts' && <AccountsView showToast={showToast} />}
                    {activeTab === 'settings' && <SettingsView showToast={showToast} onUrlChange={checkBackendHealth} />}
                    {activeTab === 'pipeline' && (
                        <Card className="h-full flex flex-col p-0">
                            <div className="overflow-auto h-full">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Budget</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(leads || []).map(lead => (
                                            <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {lead.name}
                                                    <div className="text-xs text-slate-400 font-normal">{lead.source}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge color={
                                                        lead.status === 'NEW' ? 'blue' : 
                                                        lead.status === 'BOOKED' ? 'green' : 
                                                        lead.status === 'NEGOTIATION' ? 'orange' : 'purple'
                                                    }>
                                                        {lead.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-600">{lead.budget || '--'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50">View</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </main>

        {selectedLead && (
            <Customer360Modal 
                lead={selectedLead} 
                onClose={() => setSelectedLead(null)} 
                showToast={showToast} 
                refreshData={refreshData} 
                currentUser={currentUser} 
            />
        )}

        {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
                    <h3 className="font-bold mb-4 text-slate-700 text-lg">Add New Lead</h3>
                    <form onSubmit={handleAddLead} className="space-y-3">
                        <input name="name" required placeholder="Full Name" className="w-full border p-2 rounded text-sm"/>
                        <input name="phone" required placeholder="Phone" className="w-full border p-2 rounded text-sm"/>
                        <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded text-sm"/>
                        <div className="flex gap-2">
                            <input name="budget" placeholder="Budget (e.g. 1 Cr)" className="w-full border p-2 rounded text-sm"/>
                            <select name="source" className="w-full border p-2 rounded text-sm bg-white">
                                <option value="">Source...</option>
                                {CONSTANTS.sources.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <Button className="w-full justify-center mt-4">Create Lead</Button>
                    </form>
                    <button onClick={()=>setIsAddModalOpen(false)} className="mt-4 text-xs text-red-500 hover:text-red-700 underline w-full text-center">Cancel</button>
                </div>
            </div>
        )}

        {notification && (
            <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 ${notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                {notification.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>} 
                {notification.msg}
            </div>
        )}
      </div>
    </div>
  );
}