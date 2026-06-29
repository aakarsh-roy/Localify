import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
  Eye,
  MessageSquare,
  Plus,
  Edit,
  TrendingUp
} from 'lucide-react';
import { adminAPI, categoryAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'providers') {
      fetchProviders();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({ page: currentPage, search: searchTerm });
      setUsers(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, search: searchTerm };
      if (statusFilter !== 'all') params.verified = statusFilter === 'verified';
      const response = await adminAPI.getProviders(params);
      setProviders(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await adminAPI.getReviews(params);
      setReviews(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProvider = async (providerId) => {
    try {
      await adminAPI.verifyProvider(providerId);
      toast.success('Provider verified successfully');
      fetchProviders();
    } catch (error) {
      toast.error('Failed to verify provider');
    }
  };

  const handleModerateReview = async (reviewId, status) => {
    try {
      await adminAPI.moderateReview(reviewId, { status });
      toast.success(`Review ${status}`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to moderate review');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory._id, categoryForm);
        toast.success('Category updated');
      } else {
        await adminAPI.createCategory(categoryForm);
        toast.success('Category created');
      }
      setCategoryForm({ name: '', description: '', icon: '' });
      setEditingCategory(null);
      setShowCategoryForm(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminAPI.deleteCategory(categoryId);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'providers', label: 'Providers', icon: Briefcase },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'categories', label: 'Categories', icon: Shield }
  ];

  const baseInputClass = "w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all placeholder:text-neutral-400 shadow-sm font-medium";

  const renderOverview = () => {
    if (!stats) return null;
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                  <Users className="h-6 w-6 text-neutral-950" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-extrabold text-neutral-950 tracking-tight">{stats.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                  <Briefcase className="h-6 w-6 text-neutral-950" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Providers</p>
                  <p className="text-3xl font-extrabold text-neutral-950 tracking-tight">{stats.totalProviders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                  <Calendar className="h-6 w-6 text-neutral-950" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Bookings</p>
                  <p className="text-3xl font-extrabold text-neutral-950 tracking-tight">{stats.totalBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                  <Star className="h-6 w-6 text-neutral-950" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Reviews</p>
                  <p className="text-3xl font-extrabold text-neutral-950 tracking-tight">{stats.totalReviews || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-neutral-950 mb-4 text-lg tracking-tight">Pending Verifications</h3>
              <p className="text-4xl font-extrabold text-neutral-950 tracking-tight">{stats.pendingVerifications || 0}</p>
              <p className="text-sm font-medium text-neutral-500 mt-2">Providers awaiting verification</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-neutral-950 mb-4 text-lg tracking-tight">Pending Reviews</h3>
              <p className="text-4xl font-extrabold text-neutral-950 tracking-tight">{stats.pendingReviews || 0}</p>
              <p className="text-sm font-medium text-neutral-500 mt-2">Reviews awaiting moderation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search users..."
            className={`${baseInputClass} pl-10`}
          />
        </div>
      </div>

      <Card className="overflow-hidden bg-white border border-neutral-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        fallback={user.name?.charAt(0).toUpperCase()} 
                        size="sm"
                      />
                      <div className="text-sm font-bold text-neutral-950">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      user.role === 'admin' ? 'destructive' :
                      user.role === 'provider' ? 'default' :
                      'secondary'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-neutral-400 hover:text-neutral-950 transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-neutral-500 font-medium">No users found</div>
          )}
        </div>
      </Card>

      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderProviders = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search providers..."
            className={`${baseInputClass} pl-10`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className={`${baseInputClass} sm:w-48 font-bold`}
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      <Card className="overflow-hidden bg-white border border-neutral-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {providers.map((provider) => (
                <tr key={provider._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-neutral-950">{provider.businessName}</div>
                    <div className="text-sm font-medium text-neutral-500">{provider.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-600">
                    {provider.location?.city}, {provider.location?.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StarRating rating={provider.rating?.average || 0} size="sm" />
                      <span className="text-sm font-bold text-neutral-500">({provider.rating?.count || 0})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {provider.isVerified ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                        <CheckCircle className="h-4.5 w-4.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 text-sm font-bold">
                        <AlertCircle className="h-4.5 w-4.5" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {!provider.isVerified && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyProvider(provider._id)}
                      >
                        Verify
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {providers.length === 0 && (
            <div className="p-8 text-center text-neutral-500 font-medium">No providers found</div>
          )}
        </div>
      </Card>

      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className={`${baseInputClass} sm:w-48 font-bold`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id} className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={review.rating} size="sm" />
                    <Badge variant={
                      review.status === 'approved' ? 'success' :
                      review.status === 'rejected' ? 'destructive' :
                      'warning'
                    }>
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-neutral-700 font-medium leading-relaxed">{review.comment}</p>
                  <p className="text-[10px] font-bold text-neutral-400 mt-3 uppercase tracking-wider">
                    By {review.user?.name} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {review.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerateReview(review._id, 'approved')}
                      className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-200"
                      title="Approve"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleModerateReview(review._id, 'rejected')}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && (
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-8 text-center text-neutral-500 font-medium">No reviews found</CardContent>
          </Card>
        )}
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => { setShowCategoryForm(true); setEditingCategory(null); setCategoryForm({ name: '', description: '', icon: '' }); }}
        >
          <Plus className="h-5 w-5 mr-1.5" />
          Add Category
        </Button>
      </div>

      {showCategoryForm && (
        <Card className="border-neutral-950 shadow-elevated bg-white">
          <CardHeader className="border-b border-neutral-100 pb-4">
            <CardTitle className="tracking-tight">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className={baseInputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`${baseInputClass} resize-none`}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">Icon (emoji)</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  className={baseInputClass}
                  placeholder="⚡"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary">Save Category</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => (
          <Card key={category._id} className="hover:border-neutral-950 hover:shadow-subtle transition-all group bg-white border border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {category.icon || '📦'}
                  </div>
                  <h3 className="font-bold text-neutral-950 text-lg tracking-tight">{category.name}</h3>
                  <p className="text-sm font-medium text-neutral-500 mt-1">{category.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryForm({ name: category.name, description: category.description, icon: category.icon });
                      setShowCategoryForm(true);
                    }}
                    className="p-2 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent hover:border-neutral-200"
                    title="Edit"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center gap-3 pt-4">
      <Button
        variant="outline"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="py-2 px-4 text-sm font-bold text-neutral-700 bg-white border border-neutral-200 rounded-xl shadow-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-neutral-950 rounded-[12px] flex items-center justify-center shadow-subtle">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setStatusFilter('all'); setSearchTerm(''); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                  isActive
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 border-neutral-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'providers' && renderProviders()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'categories' && renderCategories()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
