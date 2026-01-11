import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Check, X, Eye, FileText, Car, User, Building2, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const initialRequests = [
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

type VerificationRequest = typeof initialRequests[0];

export default function AdminVerification() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = requests.filter((req) => {
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (searchQuery) {
      return req.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'provider': return Building2;
      case 'driver': return User;
      case 'vehicle': return Car;
      default: return FileText;
    }
  };

  const handleReview = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowReviewDialog(true);
  };

  const handleApprove = (request: VerificationRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: 'approved' } : r
    ));
    toast.success(`${request.name} has been approved!`);
    setShowReviewDialog(false);
    setSelectedRequest(null);
  };

  const handleRejectClick = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedRequest) return;
    
    setRequests(prev => prev.map(r => 
      r.id === selectedRequest.id ? { ...r, status: 'rejected' } : r
    ));
    toast.error(`${selectedRequest.name} has been rejected`);
    setShowRejectDialog(false);
    setShowReviewDialog(false);
    setSelectedRequest(null);
    setRejectReason('');
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
          title="Approved"
          value={approvedCount.toString()}
          icon={Check}
          variant="success"
        />
        <MetricCard
          title="Rejected"
          value={rejectedCount.toString()}
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
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No requests found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredRequests.map((request, index) => {
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
                              className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground cursor-pointer hover:bg-muted/80"
                              onClick={() => toast.info(`Viewing ${doc}...`)}
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReview(request)}
                          >
                            <Eye size={14} className="mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleApprove(request)}
                          >
                            <Check size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive border-destructive/30"
                            onClick={() => handleRejectClick(request)}
                          >
                            <X size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img
                  src={selectedRequest.avatar}
                  alt={selectedRequest.name}
                  className="w-16 h-16 rounded-xl"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{selectedRequest.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    Type: {selectedRequest.type}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-foreground mb-2">Submitted Documents</h5>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{doc}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast.info(`Viewing ${doc}...`)}
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Close
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive border-destructive/30"
              onClick={() => selectedRequest && handleRejectClick(selectedRequest)}
            >
              <X size={14} className="mr-1" />
              Reject
            </Button>
            <Button 
              className="bg-success hover:bg-success/90"
              onClick={() => selectedRequest && handleApprove(selectedRequest)}
            >
              <Check size={14} className="mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to reject {selectedRequest?.name}?
            </p>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Reason (optional)
              </label>
              <Input
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
