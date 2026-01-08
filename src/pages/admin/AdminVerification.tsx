import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Check, X, Eye, FileText, Car, User, Building2, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const verificationRequests = [
  {
    id: 'v1',
    type: 'provider',
    name: 'Abuja Premium Rides',
    email: 'contact@premiumrides.ng',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=abuja',
    documents: ['Business Registration', 'Insurance Certificate', 'Tax Clearance'],
    submittedAt: new Date(Date.now() - 86400000 * 2),
    status: 'pending',
  },
  {
    id: 'v2',
    type: 'driver',
    name: 'Yusuf Mohammed',
    email: 'yusuf@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yusuf',
    documents: ['Driver License', 'National ID', 'Medical Certificate'],
    submittedAt: new Date(Date.now() - 86400000),
    status: 'pending',
  },
  {
    id: 'v3',
    type: 'vehicle',
    name: 'Toyota Highlander 2023',
    email: 'FleetMaster Nigeria',
    avatar: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=100',
    documents: ['Vehicle Registration', 'Insurance', 'Roadworthiness'],
    submittedAt: new Date(Date.now() - 86400000 * 3),
    status: 'pending',
  },
  {
    id: 'v4',
    type: 'provider',
    name: 'Kano Car Rentals',
    email: 'info@kanorentals.ng',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kano',
    documents: ['Business Registration', 'Insurance Certificate'],
    submittedAt: new Date(Date.now() - 86400000 * 4),
    status: 'approved',
  },
];

export default function AdminVerification() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const filteredRequests = verificationRequests.filter((req) => {
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (searchQuery) {
      return req.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const pendingCount = verificationRequests.filter(r => r.status === 'pending').length;
  const approvedToday = 5;
  const rejectedToday = 1;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'provider': return Building2;
      case 'driver': return User;
      case 'vehicle': return Car;
      default: return FileText;
    }
  };

  return (
    <DashboardLayout title="Verification" subtitle="Review and approve verification requests">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Pending Review"
          value={pendingCount.toString()}
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Approved Today"
          value={approvedToday.toString()}
          icon={Check}
          variant="success"
        />
        <MetricCard
          title="Rejected Today"
          value={rejectedToday.toString()}
          icon={X}
          variant="destructive"
        />
        <MetricCard
          title="Avg Review Time"
          value="4.2 hrs"
          icon={Clock}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'provider', 'driver', 'vehicle'].map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Verification Requests */}
      <div className="bg-card rounded-xl border border-border">
        <div className="divide-y divide-border">
          {filteredRequests.map((request, index) => {
            const TypeIcon = getTypeIcon(request.type);
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {request.type === 'vehicle' ? (
                        <img
                          src={request.avatar}
                          alt={request.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <img
                          src={request.avatar}
                          alt={request.name}
                          className="w-14 h-14 rounded-xl"
                        />
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <TypeIcon size={12} className="text-accent-foreground" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{request.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          request.status === 'approved' ? 'bg-success/10 text-success' :
                          request.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {request.documents.map((doc) => (
                          <span
                            key={doc}
                            className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Submitted</p>
                      <p className="text-foreground font-medium">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          Review
                        </Button>
                        <Button size="sm" className="bg-success hover:bg-success/90">
                          <Check size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/30">
                          <X size={14} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
