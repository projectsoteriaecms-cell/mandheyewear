import { useState } from 'react';
import { AdminLayout } from '@/shared/layouts/admin';
import { RoleGuard } from '@/modules/auth/components/RoleGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  CrmAccessGate,
  useAllWhatsAppTemplates,
  useCreateWhatsAppTemplate,
  useUpdateWhatsAppTemplate,
  useDeactivateWhatsAppTemplate,
  useApproveWhatsAppTemplate,
  useRejectWhatsAppTemplate,
  type WhatsAppTemplate,
} from '@/modules/crm';
import { CrmTabs } from './CrmTabs';

interface TemplateForm {
  name: string;
  description: string;
  twilio_content_sid: string;
  body_preview: string;
  variables: string;
  cost_per_message: string;
}

const emptyForm: TemplateForm = {
  name: '',
  description: '',
  twilio_content_sid: '',
  body_preview: '',
  variables: '',
  cost_per_message: '0.0039',
};

export default function WhatsAppTemplates() {
  const templates = useAllWhatsAppTemplates();
  const createTemplate = useCreateWhatsAppTemplate();
  const updateTemplate = useUpdateWhatsAppTemplate();
  const deactivateTemplate = useDeactivateWhatsAppTemplate();
  const approveTemplate = useApproveWhatsAppTemplate();
  const rejectTemplate = useRejectWhatsAppTemplate();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalTemplateId, setApprovalTemplateId] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [form, setForm] = useState<TemplateForm>(emptyForm);

  const handleCreateOpen = () => {
    setForm(emptyForm);
    setShowCreateDialog(true);
  };

  const handleEditOpen = (template: WhatsAppTemplate) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      description: template.description || '',
      twilio_content_sid: template.twilio_content_sid,
      body_preview: template.body_preview,
      variables: template.variables.join(', '),
      cost_per_message: template.cost_per_message.toString(),
    });
    setShowEditDialog(true);
  };

  const handleSaveCreate = () => {
    if (!form.name.trim() || !form.twilio_content_sid.trim() || !form.body_preview.trim()) {
      toast.error('Name, Twilio SID, and body preview are required');
      return;
    }

    createTemplate.mutate(
      {
        name: form.name,
        description: form.description || undefined,
        twilio_content_sid: form.twilio_content_sid,
        body_preview: form.body_preview,
        variables: form.variables
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v),
        cost_per_message: parseFloat(form.cost_per_message) || 0.0039,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setForm(emptyForm);
        },
      },
    );
  };

  const handleSaveEdit = () => {
    if (!editingId || !form.name.trim() || !form.twilio_content_sid.trim() || !form.body_preview.trim()) {
      toast.error('Name, Twilio SID, and body preview are required');
      return;
    }

    updateTemplate.mutate(
      {
        id: editingId,
        name: form.name,
        description: form.description || undefined,
        twilio_content_sid: form.twilio_content_sid,
        body_preview: form.body_preview,
        variables: form.variables
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v),
        cost_per_message: parseFloat(form.cost_per_message) || 0.0039,
      },
      {
        onSuccess: () => {
          setShowEditDialog(false);
          setEditingId(null);
          setForm(emptyForm);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deactivateTemplate.mutate(deletingId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setDeletingId(null);
      },
    });
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
            <p className="text-muted-foreground">
              Manage Twilio-approved WhatsApp message templates. Templates cost 50% less than plain text.
            </p>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            {/* Create Button */}
            <Button onClick={handleCreateOpen}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>

            {/* Templates Table */}
            {templates.isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : templates.data?.length ? (
              <Card className="overflow-hidden">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Body Preview</TableCell>
                      <TableCell>Variables</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Approval</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates.data.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{template.body_preview}</TableCell>
                        <TableCell className="text-sm">
                          {template.variables.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((v) => (
                                <Badge key={v} variant="secondary" className="text-xs">
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono">${template.cost_per_message.toFixed(4)}</TableCell>
                        <TableCell>
                          {template.approval_state === 'approved' && (
                            <Badge variant="default" className="bg-green-600">Approved</Badge>
                          )}
                          {template.approval_state === 'rejected' && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                          {template.approval_state === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.active ? 'default' : 'secondary'}>
                            {template.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {template.approval_state === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="Approve"
                                onClick={() => approveTemplate.mutate({ templateId: template.id })}
                                disabled={approveTemplate.isPending}
                              >
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                title="Reject"
                                onClick={() => {
                                  setApprovalTemplateId(template.id);
                                  setApprovalNotes('');
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <X className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOpen(template)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setDeletingId(template.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <Card className="p-6 text-center text-muted-foreground">No templates yet. Create one to get started.</Card>
            )}
          </CrmAccessGate>
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create WhatsApp Template</DialogTitle>
              <DialogDescription>
                Set up a new Twilio-approved template for WhatsApp campaigns.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <Input
                  placeholder="e.g., Welcome, Promotion, Appointment Reminder"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <Input
                  placeholder="What is this template for?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Twilio Content SID</label>
                <Input
                  placeholder="e.g., HXxxx..."
                  value={form.twilio_content_sid}
                  onChange={(e) => setForm({ ...form, twilio_content_sid: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Body Preview</label>
                <Textarea
                  placeholder="Hi {{name}}, welcome to M&H Eyewear!"
                  value={form.body_preview}
                  onChange={(e) => setForm({ ...form, body_preview: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">Use {{variable}} for personalization</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Variables (comma-separated)</label>
                <Input
                  placeholder="e.g., name, discount, date, time"
                  value={form.variables}
                  onChange={(e) => setForm({ ...form, variables: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cost per Message</label>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="0.0039"
                  value={form.cost_per_message}
                  onChange={(e) => setForm({ ...form, cost_per_message: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCreate} disabled={createTemplate.isPending}>
                {createTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Twilio Content SID</label>
                <Input
                  value={form.twilio_content_sid}
                  onChange={(e) => setForm({ ...form, twilio_content_sid: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Body Preview</label>
                <Textarea
                  value={form.body_preview}
                  onChange={(e) => setForm({ ...form, body_preview: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Variables</label>
                <Input
                  value={form.variables}
                  onChange={(e) => setForm({ ...form, variables: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cost per Message</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.cost_per_message}
                  onChange={(e) => setForm({ ...form, cost_per_message: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateTemplate.isPending}>
                {updateTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Template?</AlertDialogTitle>
              <AlertDialogDescription>
                This template will no longer be available for new campaigns, but won't affect existing campaigns using it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep It</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deactivateTemplate.isPending} className="bg-destructive hover:bg-destructive/90">
                {deactivateTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Approval Dialog (rejection) */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Template?</DialogTitle>
              <DialogDescription>
                Provide optional notes explaining why you're rejecting this template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="e.g., Missing unsubscribe link, uses prohibited language, etc."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Keep Pending
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (approvalTemplateId) {
                    rejectTemplate.mutate(
                      { templateId: approvalTemplateId, notes: approvalNotes || undefined },
                      {
                        onSuccess: () => {
                          setShowApprovalDialog(false);
                          setApprovalTemplateId(null);
                          setApprovalNotes('');
                        },
                      }
                    );
                  }
                }}
                disabled={rejectTemplate.isPending}
              >
                {rejectTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </RoleGuard>
  );
}
