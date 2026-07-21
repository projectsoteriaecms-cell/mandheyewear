import { useState } from 'react';
import { AdminLayout } from '@/shared/layouts/admin';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Search, Download, Trash2, Ban, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  CrmAccessGate,
  useConsentHistory,
  useSuppressionHistory,
  useCampaignSendHistory,
  useAccessLog,
  useLogConsentChange,
  useSuppressEmail,
  useGdprExport,
  useGdprDelete,
} from '@/modules/crm';
import { CrmTabs } from './CrmTabs';
import { RoleGuard } from "@/modules/auth";

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Compliance() {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showSuppressDialog, setShowSuppressDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [suppressReason, setSuppressReason] = useState('');

  const consentHistory = useConsentHistory(selectedEmail || undefined);
  const suppressionHistory = useSuppressionHistory(selectedEmail || undefined);
  const campaignHistory = useCampaignSendHistory(selectedEmail || undefined);
  const accessLog = useAccessLog(selectedEmail || undefined);

  const logConsent = useLogConsentChange();
  const suppressEmail = useSuppressEmail();
  const gdprExport = useGdprExport();
  const gdprDelete = useGdprDelete();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchEmail.trim()) {
      setSelectedEmail(searchEmail.trim().toLowerCase());
    }
  };

  const handleSuppress = () => {
    if (!selectedEmail) return;
    suppressEmail.mutate(
      {
        email: selectedEmail,
        reason: suppressReason || 'manual_suppression',
        autoUnsuppressDays: 180,
      },
      {
        onSuccess: () => {
          toast.success('Email suppressed for 180 days');
          setShowSuppressDialog(false);
          setSuppressReason('');
        },
        onError: (err) => toast.error(String(err)),
      },
    );
  };

  const handleExport = () => {
    if (!selectedEmail) return;
    gdprExport.mutate(selectedEmail, {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gdpr-export-${selectedEmail}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
        setShowExportDialog(false);
      },
      onError: (err) => toast.error(String(err)),
    });
  };

  const handleDelete = () => {
    if (!selectedEmail) return;
    gdprDelete.mutate(selectedEmail, {
      onSuccess: () => {
        toast.success('Contact permanently deleted');
        setSelectedEmail(null);
        setSearchEmail('');
        setShowDeleteDialog(false);
      },
      onError: (err) => toast.error(String(err)),
    });
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Compliance & Audit</h1>
            <p className="text-muted-foreground">
              GDPR, consent tracking, suppression history, and data access logs.
            </p>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            {/* Search */}
            <Card className="p-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </form>
            </Card>

            {selectedEmail && (
              <>
                {/* Header + Actions */}
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Viewing contact</p>
                      <p className="font-mono text-lg font-medium">{selectedEmail}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSuppressDialog(true)}
                        disabled={suppressEmail.isPending}
                      >
                        {suppressEmail.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        <Ban className="mr-1.5 h-3.5 w-3.5" /> Suppress
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowExportDialog(true)}
                        disabled={gdprExport.isPending}
                      >
                        {gdprExport.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={gdprDelete.isPending}
                      >
                        {gdprDelete.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Consent History */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">Consent History</h2>
                  {consentHistory.isLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                  ) : consentHistory.data?.length ? (
                    <Card className="overflow-hidden">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Changed</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {consentHistory.data.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium capitalize">{entry.consent_type}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{fmtDate(entry.changed_at)}</TableCell>
                              <TableCell>
                                <Badge variant={entry.old_value ? 'default' : 'secondary'}>
                                  {entry.old_value === null ? 'Unknown' : entry.old_value ? 'Yes' : 'No'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={entry.new_value ? 'default' : 'secondary'}>
                                  {entry.new_value ? 'Yes' : 'No'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{entry.reason || '—'}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{entry.changed_by || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center text-muted-foreground">No consent changes</Card>
                  )}
                </div>

                {/* Suppression History */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">Suppression History</h2>
                  {suppressionHistory.isLoading ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                  ) : suppressionHistory.data?.length ? (
                    <Card className="overflow-hidden">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Suppressed At</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Auto-Unsuppress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {suppressionHistory.data.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium capitalize">{entry.suppressed_type}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{fmtDate(entry.suppressed_at)}</TableCell>
                              <TableCell className="text-sm">{entry.reason}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{entry.source || '—'}</TableCell>
                              <TableCell className="text-sm">
                                {entry.auto_unsuppress_at ? fmtDate(entry.auto_unsuppress_at) : 'Never'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center text-muted-foreground">No suppressions</Card>
                  )}
                </div>

                {/* Campaign Send History */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">Campaign Send History</h2>
                  {campaignHistory.isLoading ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                  ) : campaignHistory.data?.length ? (
                    <Card className="overflow-hidden">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Campaign</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Sent At</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Consent</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {campaignHistory.data.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium text-sm">{entry.campaign_id}</TableCell>
                              <TableCell className="text-sm">{entry.subject_line || '—'}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{fmtDate(entry.sent_at)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {entry.bounced_at ? (
                                    <>
                                      <AlertTriangle className="h-4 w-4 text-destructive" />
                                      <span className="text-sm text-destructive">Bounced</span>
                                    </>
                                  ) : entry.opened_at ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                                      <span className="text-sm text-emerald-600">Opened</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-4 w-4 text-amber-600" />
                                      <span className="text-sm text-amber-600">Sent</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={entry.had_marketing_consent ? 'default' : 'destructive'}>
                                  {entry.had_marketing_consent ? 'Yes' : 'No'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center text-muted-foreground">No campaigns sent</Card>
                  )}
                </div>

                {/* Access Log */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">Data Access Log</h2>
                  {accessLog.isLoading ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                    </div>
                  ) : accessLog.data?.length ? (
                    <Card className="overflow-hidden">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Action</TableCell>
                            <TableCell>Accessed At</TableCell>
                            <TableCell>Reason</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {accessLog.data.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium capitalize">{entry.action}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{fmtDate(entry.accessed_at)}</TableCell>
                              <TableCell className="text-sm">{entry.reason || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center text-muted-foreground">No access logs</Card>
                  )}
                </div>
              </>
            )}
          </CrmAccessGate>
        </div>

        {/* Suppress Dialog */}
        <Dialog open={showSuppressDialog} onOpenChange={setShowSuppressDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suppress Email</DialogTitle>
              <DialogDescription>
                Block this email from receiving marketing communications for 180 days.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <Input
                  placeholder="e.g., User request, complaint, etc."
                  value={suppressReason}
                  onChange={(e) => setSuppressReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuppressDialog(false)}>Cancel</Button>
              <Button onClick={handleSuppress} disabled={suppressEmail.isPending} className="bg-destructive hover:bg-destructive/90">
                {suppressEmail.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Suppress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Personal Data (GDPR)</DialogTitle>
              <DialogDescription>
                Download all personal data for {selectedEmail} as JSON.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Includes contact info, consent history, suppression history, campaign sends, and access logs.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={handleExport} disabled={gdprExport.isPending}>
                {gdprExport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Contact (GDPR Right to be Forgotten)</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all personal data for <strong>{selectedEmail}</strong>. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={gdprDelete.isPending} className="bg-destructive hover:bg-destructive/90">
                {gdprDelete.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </RoleGuard>
  );
}
