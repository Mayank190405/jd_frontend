// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import {
  Building,
  Home,
  Users,
  FileText,
  Calendar,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  ChevronDown,
  Check,
  User
} from 'lucide-react';

// API Utility
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.jaydevelopers.com';

export const fetchAPI = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'Authorization': token ? `Bearer ${token}` : '',
  };

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Login Component
const Login = ({ onLogin, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      onLogin(data);
      showToast('Login successful');
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Building size={48} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">JD CRM</h1>
            <p className="text-gray-600 mt-2">Property Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter email or phone"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>Demo credentials: admin@realty.com / password</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ currentUser, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Building, label: 'Projects', path: '/projects' },
    { icon: FileText, label: 'Inventory', path: '/inventory' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: BarChart, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Building size={24} className="text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">JD CRM</span>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <Building size={24} className="text-indigo-600" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="font-bold text-indigo-600">
              {currentUser?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-sm text-gray-500">{currentUser?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// Navbar Component
const Navbar = ({ currentUser }) => {
  const [search, setSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-indigo-600">
                  {currentUser?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role}</p>
              </div>
              <ChevronDown size={16} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <Link
                  to="/logout"
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = ({ currentUser, showToast, fetchAPI }) => {
  const [stats, setStats] = useState({
    total_leads: 0,
    visits_count: 0,
    converted_count: 0,
    revenue: 0,
    formatted_revenue: '₹0',
    pipeline_breakdown: [],
    recent_leads: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await fetchAPI('/api/dashboard/stats');
      setStats(data);
    } catch (err) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <Users className="text-indigo-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total_leads}</p>
          <p className="text-sm text-gray-500 mt-2">Active leads in pipeline</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Site Visits</h3>
            <Calendar className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.visits_count}</p>
          <p className="text-sm text-gray-500 mt-2">Completed this month</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Converted</h3>
            <Check className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.converted_count}</p>
          <p className="text-sm text-gray-500 mt-2">Leads converted to bookings</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <BarChart className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.formatted_revenue}</p>
          <p className="text-sm text-gray-500 mt-2">Total deal amount</p>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
          </div>
          <div className="p-4">
            {stats.recent_leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{lead.budget || 'N/A'}</p>
                  <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                    lead.status === 'BOOKED' ? 'bg-green-100 text-green-800' :
                    lead.status === 'SITE_VISIT' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lead.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Pipeline Breakdown</h2>
          </div>
          <div className="p-4">
            {stats.pipeline_breakdown.map((item) => (
              <div key={item.status} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.status}</span>
                  <span className="text-sm font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(item.count / stats.total_leads) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Projects Component
const Projects = ({ currentUser, showToast, fetchAPI, hasPermission }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    type: '',
    address: '',
    developer_name: '',
    total_floors: 0,
    total_towers: 0,
    status: 'Active',
    launch_date: '',
    possession_date: '',
    amenities: []
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/api/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      await fetchAPI('/api/projects', 'POST', newProject);
      showToast("Project created successfully");
      setShowCreateModal(false);
      loadProjects();
      setNewProject({
        name: '',
        location: '',
        type: '',
        address: '',
        developer_name: '',
        total_floors: 0,
        total_towers: 0,
        status: 'Active',
        launch_date: '',
        possession_date: '',
        amenities: []
      });
    } catch (err) {
      showToast("Failed to create project: " + err.message, "error");
    }
  };

  const handleQuickCreate = async () => {
    try {
      const project = {
        name: newProject.name,
        location: newProject.location,
        type: newProject.type || "Residential",
        total_floors: newProject.total_floors || 10,
        total_towers: newProject.total_towers || 1
      };
      await fetchAPI('/api/projects/quick', 'POST', project);
      showToast("Project created successfully");
      setShowCreateModal(false);
      loadProjects();
    } catch (err) {
      showToast("Failed to create project: " + err.message, "error");
    }
  };

  if (!hasPermission(currentUser, 'manage_projects')) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <EyeOff size={64} className="mb-4" />
        <h2 className="text-xl font-bold text-gray-600">Access Restricted</h2>
        <p className="text-sm mt-2">You don't have permission to manage projects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage property projects and inventory</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                  <p className="text-gray-500">{project.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  project.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{project.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Developer:</span>
                  <span className="font-medium">{project.developer_name || 'Jay Developers'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Floors:</span>
                  <span className="font-medium">{project.total_floors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Towers:</span>
                  <span className="font-medium">{project.total_towers}</span>
                </div>
                {project.inventory_stats && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Units:</span>
                      <span className="font-medium">
                        {project.inventory_stats.available_units} available / {project.inventory_stats.total_units} total
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sold:</span>
                      <span className="font-medium">{project.inventory_stats.sold_units}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  View Details
                </Link>
                <button
                  onClick={() => window.location.href = `/inventory?project_id=${project.id}`}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm"
                >
                  Inventory
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="font-bold text-xl mb-6">Create New Project</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g., Sunrise Apartments"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProject.location}
                  onChange={e => setNewProject({...newProject, location: e.target.value})}
                  placeholder="e.g., Nashik"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Floors</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newProject.total_floors}
                    onChange={e => setNewProject({...newProject, total_floors: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Towers</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newProject.total_towers}
                    onChange={e => setNewProject({...newProject, total_towers: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProject.type}
                  onChange={e => setNewProject({...newProject, type: e.target.value})}
                >
                  <option value="">Select type</option>
                  <option value="Residential Apartments">Residential Apartments</option>
                  <option value="Commercial Complex">Commercial Complex</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Plotted Development">Plotted Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Developer Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newProject.developer_name}
                  onChange={e => setNewProject({...newProject, developer_name: e.target.value})}
                  placeholder="Jay Developers"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickCreate}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Quick Create
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name || !newProject.location}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Leads Component
const Leads = ({ currentUser, showToast, fetchAPI }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
    source: 'Walk-in',
    project_id: '',
    owner_id: ''
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/api/leads');
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      await fetchAPI('/api/leads', 'POST', newLead);
      showToast("Lead created successfully");
      setShowCreateModal(false);
      loadLeads();
      setNewLead({
        name: '',
        phone: '',
        email: '',
        budget: '',
        source: 'Walk-in',
        project_id: '',
        owner_id: ''
      });
    } catch (err) {
      showToast("Failed to create lead: " + err.message, "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED': return 'bg-green-100 text-green-800';
      case 'SITE_VISIT': return 'bg-blue-100 text-blue-800';
      case 'NEGOTIATION': return 'bg-yellow-100 text-yellow-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage and track customer leads</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/api/leads/template'}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-2"
          >
            <Download size={16} />
            Import Template
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">All Leads ({leads.length})</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm flex items-center gap-2">
                  <Filter size={14} />
                  Filter
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm flex items-center gap-2">
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">ID: {lead.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p>{lead.phone}</p>
                        {lead.email && <p className="text-sm text-gray-500">{lead.email}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{lead.budget || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Eye size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        {currentUser.role === 'Admin' && (
                          <button className="p-2 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-xl mb-6">Add New Lead</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLead.name}
                  onChange={e => setNewLead({...newLead, name: e.target.value})}
                  placeholder="Enter lead name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLead.phone}
                  onChange={e => setNewLead({...newLead, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLead.email}
                  onChange={e => setNewLead({...newLead, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLead.source}
                  onChange={e => setNewLead({...newLead, source: e.target.value})}
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Broker">Broker</option>
                  <option value="Google">Google</option>
                  <option value="Meta">Meta</option>
                  <option value="Portal">Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newLead.budget}
                  onChange={e => setNewLead({...newLead, budget: e.target.value})}
                  placeholder="e.g., 1.2 Cr, 65 L"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLead}
                disabled={!newLead.name || !newLead.phone}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'x-user-id': userId,
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    }
    setLoading(false);
  };

  const handleLogin = (loginData) => {
    localStorage.setItem('token', loginData.access_token);
    localStorage.setItem('userId', loginData.user.id);
    setCurrentUser(loginData.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const hasPermission = (user, permission) => {
    if (!user) return false;
    
    const rolePermissions = {
      'Admin': ['manage_projects', 'manage_inventory', 'manage_leads', 'manage_users', 'manage_bookings', 'view_reports'],
      'Manager': ['manage_projects', 'manage_inventory', 'manage_leads', 'manage_bookings', 'view_reports'],
      'Sales Exec': ['manage_leads', 'create_bookings', 'view_reports'],
      'Telecaller': ['view_leads', 'create_interactions'],
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      {isAuthenticated ? (
        <div className="flex h-screen bg-gray-50">
          <Sidebar currentUser={currentUser} onLogout={handleLogout} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar currentUser={currentUser} />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={
                  <Dashboard 
                    currentUser={currentUser} 
                    showToast={showToast}
                    fetchAPI={fetchAPI}
                  />
                } />
                <Route path="/projects" element={
                  <Projects 
                    currentUser={currentUser} 
                    showToast={showToast}
                    fetchAPI={fetchAPI}
                    hasPermission={hasPermission}
                  />
                } />
                <Route path="/leads" element={
                  <Leads 
                    currentUser={currentUser} 
                    showToast={showToast}
                    fetchAPI={fetchAPI}
                  />
                } />
                <Route path="/inventory" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Building size={64} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-600">Inventory Module</h2>
                      <p className="text-gray-500">Under development</p>
                    </div>
                  </div>
                } />
                <Route path="/bookings" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-600">Bookings Module</h2>
                      <p className="text-gray-500">Under development</p>
                    </div>
                  </div>
                } />
                <Route path="/users" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Users size={64} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-600">Users Module</h2>
                      <p className="text-gray-500">Under development</p>
                    </div>
                  </div>
                } />
                <Route path="/reports" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BarChart size={64} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-600">Reports Module</h2>
                      <p className="text-gray-500">Under development</p>
                    </div>
                  </div>
                } />
                <Route path="/settings" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Settings size={64} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-600">Settings Module</h2>
                      <p className="text-gray-500">Under development</p>
                    </div>
                  </div>
                } />
                <Route path="/profile" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <User size={64} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-600">Profile Module</h2>
                      <p className="text-gray-500">Under development</p>
                    </div>
                  </div>
                } />
                <Route path="/logout" element={
                  <Navigate to="/login" />
                } />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Login onLogin={handleLogin} showToast={showToast} />
      )}
    </Router>
  );
};

export default App;
