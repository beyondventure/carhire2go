import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Check, X, Eye, FileText, Car, User, Building2, Clock, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type VerificationType = 'provider' | 'driver';
type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface VerificationRequest {
  id: string;
  type: VerificationType;
  name: string;
  email: string;
  avatar: string;
  documents: string[];
  submittedAt: string;
  status: VerificationStatus;
}

function docsForProvider(row: any): string[] {
  const docs: string[] = [];
  if (row.cac_number) docs.push('CAC Registration');
  if (row.cac_document_url) docs.push('CAC Document');
  if (row.nin_number) docs.push('NIN');
  if (row.bank_name) docs.push('Bank Details');
  return docs.length > 0 ? docs : ['Business Registration'];
}

function docsForDriver(row: any): string[] {
  const docs: string[] = [];
  if (row.license_number) docs.push('Driver\'s License');
  if (row.nin_number) docs.push('National ID (NIN)');
  return docs.length > 0 ? docs : ['Driver\'s License'];
}

export default function AdminVerification() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isActing, setIsActing] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const [providersRes, driversRes] = await Promise.all([
        supabase
          .from('providers')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('drivers')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const providersRaw = providersRes.data || [];
      const driversRaw = driversRes.data || [];

      // Collect all user IDs for manual profile join
      const userIds = [
        ...new Set([
          ...providersRaw.map(p => p.user_id),
          ...driversRaw.map(d => d.user_id),
        ])
      ];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', userIds);
      
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const providerRows: VerificationRequest[] = providersRaw.map((row: any) => {
        const profile = profilesMap.get(row.user_id);
        return {
          id: `provider:${row.id}`,
          type: 'provider' as VerificationType,
          name: row.business_name || profile?.name || 'Unknown Provider',
          email: profile?.email || '',
          avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.id}`,
          documents: docsForProvider(row),
          submittedAt: row.created_at,
          status: (row.verification_status || 'pending') as VerificationStatus,
        };
      });

      const driverRows: VerificationRequest[] = driversRaw.map((row: any) => {
        const profile = profilesMap.get(row.user_id);
        return {
          id: `driver:${row.id}`,
          type: 'driver' as VerificationType,
          name: profile?.name || 'Unknown Driver',
          email: profile?.email || '',
          avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.id}`,
          documents: docsForDriver(row),
          submittedAt: row.created_at,
          status: (row.verification_status || 'pending') as VerificationStatus,
        };
      });

      setRequests([...providerRows, ...driverRows].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ));
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      toast.error('Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (request: VerificationRequest, status: VerificationStatus) => {
    const [type, rawId] = request.id.split(':');
    const table = type === 'provider' ? 'providers' : 'drivers';

    const { error } = await supabase
      .from(table as any)
      .update({ verification_status: status })
      .eq('id', rawId);

    if (error) throw error;
  };

  const handleApprove = async (request: VerificationRequest) => {
    setIsActing(true);
    try {
      await updateStatus(request, 'approved');
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
      toast.success(`${request.name} has been approved`);
      setShowReviewDialog(false);
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setIsActing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;
    setIsActing(true);
    try {
      await updateStatus(selectedRequest, 'rejected');
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'rejected' } : r));
      toast.error(`${selectedRequest.name} has been rejected`);
      setShowRejectDialog(false);
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    } finally {
      setIsActing(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (searchQuery) return req.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'under_review').length;
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

  return (
    <DashboardLayout title="Verification" subtitle="Review and approve verification requests">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Pending Review" value={pendingCount.toString()} icon={Clock} variant="warning" />
        <MetricCard title="Approved" value={approvedCount.toString()} icon={Check} variant="success" />
        <MetricCard title="Rejected" value={rejectedCount.toString()} icon={X} variant="destructive" />
        <MetricCard title="Total" value={requests.length.toString()} icon={Shield} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'provider', 'driver'].map(type => (
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
          {['pending', 'approved', 'rejected', 'all'].map(status => (
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

      {/* Requests List */}
      <div className="bg-card rounded-xl border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
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
                    transition={{ delay: index * 0.04 }}
                    className="p-5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={request.avatar}
                            alt={request.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
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
                            {request.documents.map(doc => (
                              <span
                                key={doc}
                                className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground cursor-pointer hover:bg-muted/80"
                                onClick={() => toast.info(`Viewing ${doc}…`)}
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
                        {(request.status === 'pending' || request.status === 'under_review') && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(request); setShowReviewDialog(true); }}>
                              <Eye size={14} className="mr-1" /> Review
                            </Button>
                            <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleApprove(request)} disabled={isActing}>
                              <Check size={14} className="mr-1" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => { setSelectedRequest(request); setShowRejectDialog(true); }} disabled={isActing}>
                              <X size={14} className="mr-1" /> Reject
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
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Review Verification Request</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img src={selectedRequest.avatar} alt={selectedRequest.name} className="w-16 h-16 rounded-xl" />
                <div>
                  <h4 className="font-semibold text-foreground">{selectedRequest.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">Type: {selectedRequest.type}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-foreground mb-2">Submitted Documents</h5>
                <div className="space-y-2">
                  {selectedRequest.documents.map(doc => (
                    <div key={doc} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing ${doc}…`)}>
                        <Eye size={14} className="mr-1" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Close</Button>
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => selectedRequest && (setShowRejectDialog(true))}>
              <X size={14} className="mr-1" /> Reject
            </Button>
            <Button className="bg-success hover:bg-success/90" onClick={() => selectedRequest && handleApprove(selectedRequest)} disabled={isActing}>
              <Check size={14} className="mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Verification</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">Are you sure you want to reject {selectedRequest?.name}?</p>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Reason (optional)</label>
              <Input placeholder="Enter rejection reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={isActing}>
              {isActing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <X size={14} className="mr-1" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
