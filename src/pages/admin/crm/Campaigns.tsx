import { useState, useMemo } from 'react';
import { AdminLayout } from '@/shared/layouts/admin';
import { RoleGuard } from '@/modules/auth/components/RoleGuard';
import { useIsSuperAdmin } from '@/modules/auth/hooks/useUserRole';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Loader2, ShieldAlert, Gauge, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CrmAccessGate,
  TriggerCard,
  useCrmCampaigns,
  useCrmSegments,
  useCreateCampaign,
  useDeleteCampaign,
  useTriggerCampaignSend,
  useSendQuotaStatus,
  useGlobalKillSwitch,
  useReengagementTriggers,
  CampaignDetailModal,
  CampaignActionDialog,
  CampaignSearchFilter,
  CampaignsTabContent,
  CampaignBulkActionsBar,
  useDuplicateCampaign,
  useArchiveCampaigns,
  useUnarchiveCampaigns,
  useDeleteCampaignsBulk,
  type CrmCampaign,
} from '@/modules/crm';
import { TemplatesGallery } from '@/modules/crm/components/TemplatesGallery';
import { CreateTriggerDialog } from '@/modules/crm/components/CreateTriggerDialog';
import { CrmTabs } from './CrmTabs';

type TabType = 'drafts' | 'active' | 'completed' | 'archived' | 'templates' | 'triggers';
type DateFilterType = 'all' | 'week' | 'month';

// Send Control Bar
function SendControlBar() {
  const q = useSendQuotaStatus();
  const { isSuperAdmin } = useIsSuperAdmin();
  const kill = useGlobalKillSwitch();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Card className="flex flex-1 items-center gap-3 p-4">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20">
          <Gauge className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Daily send quota</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {q.todaySent.toLocaleString()} / {q.quotaLimit.toLocaleString()} · day {q.warmupDay}
            </span>
          </div>
        </div>
      </Card>

      {q.globalKill && (
        <Card className="flex items-center gap-2 border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <ShieldAlert className="h-5 w-5 flex-none" />
          <span>Global kill switch is ON — all bulk sends halted.</span>
        </Card>
      )}

      {isSuperAdmin && (
        <Button
          variant={q.globalKill ? 'outline' : 'destructive'}
          onClick={() => kill.mutate(!q.globalKill)}
          disabled={kill.isPending}
          className="sm:self-stretch"
        >
          {kill.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
          {q.globalKill ? 'Re-enable sends' : 'Emergency stop'}
        </Button>
      )}
    </div>
  );
}

// Create Campaign Dialog
function CreateCampaign({ onClose }: { onClose: () => void }) {
  const { data: segments } = useCrmSegments();
  const create = useCreateCampaign();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [segmentId, setSegmentId] = useState('');

  function save() {
    if (!name.trim() || !segmentId) return;
    create.mutate(
      { name: name.trim(), subject_line: subject.trim() || null, segment_id: segmentId },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Campaign Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. June frame sale"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Recipients (Segment) <span className="text-destructive">*</span>
            </label>
            <Select value={segmentId} onValueChange={setSegmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose who receives this…" />
              </SelectTrigger>
              <SelectContent>
                {(segments ?? []).map((seg) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    <span className="font-medium">{seg.name}</span>
                    {seg.member_count > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        · {seg.member_count.toLocaleString()} contacts
                      </span>
                    )}
                  </SelectItem>
                ))}
                {(segments ?? []).length === 0 && (
                  <SelectItem value="__none__" disabled>
                    No segments yet — create one in the Segments tab
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Subject Line</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Exclusive offer just for you 🎁"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              You can edit this and all other fields after creating the draft.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim() || !segmentId || create.isPending}>
            {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Filter campaigns helper
function filterAndSearchCampaigns(
  campaigns: CrmCampaign[] | undefined,
  status: 'draft' | 'active' | 'completed' | 'archived',
  searchQuery: string,
  dateFilter: DateFilterType,
) {
  if (!campaigns) return [];

  let filtered = campaigns.filter((c) => {
    // Archived campaigns only appear under the Archived tab; everywhere else
    // they are hidden regardless of their underlying status.
    if (status === 'archived') return c.is_archived === true;
    if (c.is_archived) return false;
    if (status === 'draft') return c.status === 'draft';
    if (status === 'active') return c.status === 'running' || c.status === 'scheduled' || c.status === 'paused';
    if (status === 'completed') return c.status === 'completed';
    return false;
  });

  if (dateFilter !== 'all') {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const daysAgo = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 0;
    const cutoff = now - daysAgo * dayMs;

    filtered = filtered.filter((c) => new Date(c.created_at).getTime() >= cutoff);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.segment_name?.toLowerCase().includes(q) ||
        c.subject_line?.toLowerCase().includes(q)
    );
  }

  return filtered;
}

// Main Campaigns Component
const CrmCampaigns = () => {
  const { data: campaigns, isLoading } = useCrmCampaigns();
  const { data: triggers } = useReengagementTriggers();
  const duplicateCampaign = useDuplicateCampaign();
  const archiveCampaigns = useArchiveCampaigns();
  const unarchiveCampaigns = useUnarchiveCampaigns();
  const deleteBulk = useDeleteCampaignsBulk();

  const [currentTab, setCurrentTab] = useState<TabType>('drafts');
  const [creating, setCreating] = useState(false);
  const [creatingTrigger, setCreatingTrigger] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CrmCampaign | null>(null);
  const [actionCampaign, setActionCampaign] = useState<CrmCampaign | null>(null);
  const [actionType, setActionType] = useState<'send' | 'test' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Tab counts (raw, ignoring search/date filter)
  const tabCounts = useMemo(() => {
    const all = campaigns ?? [];
    return {
      drafts:    all.filter((c) => !c.is_archived && c.status === 'draft').length,
      active:    all.filter((c) => !c.is_archived && (c.status === 'running' || c.status === 'scheduled' || c.status === 'paused')).length,
      completed: all.filter((c) => !c.is_archived && c.status === 'completed').length,
      archived:  all.filter((c) => c.is_archived).length,
    };
  }, [campaigns]);

  const draftCampaigns = useMemo(
    () => filterAndSearchCampaigns(campaigns, 'draft', searchQuery, dateFilter),
    [campaigns, searchQuery, dateFilter],
  );
  const activeCampaigns = useMemo(
    () => filterAndSearchCampaigns(campaigns, 'active', searchQuery, dateFilter),
    [campaigns, searchQuery, dateFilter],
  );
  const completedCampaigns = useMemo(
    () => filterAndSearchCampaigns(campaigns, 'completed', searchQuery, dateFilter),
    [campaigns, searchQuery, dateFilter],
  );
  const archivedCampaigns = useMemo(
    () => filterAndSearchCampaigns(campaigns, 'archived', searchQuery, dateFilter),
    [campaigns, searchQuery, dateFilter],
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
  };

  const handleSelectionChange = (campaignId: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(campaignId);
    } else {
      newSelected.delete(campaignId);
    }
    setSelectedIds(newSelected);
  };

  const handleDuplicateSelected = async () => {
    const selectedArray = Array.from(selectedIds);
    for (const id of selectedArray) {
      await duplicateCampaign.mutateAsync(id);
    }
    setSelectedIds(new Set());
  };

  const handleArchiveSelected = () => {
    archiveCampaigns.mutate(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleUnarchiveSelected = () => {
    unarchiveCampaigns.mutate(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    deleteBulk.mutate(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const openAction = (type: 'send' | 'test') => {
    setActionCampaign(selectedCampaign);
    setActionType(type);
    setSelectedCampaign(null);
  };

  const closeAction = () => {
    setActionCampaign(null);
    setActionType(null);
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin', 'branch_manager']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">CRM Campaigns</h1>
              <p className="text-muted-foreground">
                Create, schedule, and send email campaigns to your segments.
              </p>
            </div>
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            <SendControlBar />

            {/* Lifecycle banner */}
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Campaign lifecycle:</span>
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium">📝 Draft</span>
              <ArrowRight className="h-3 w-3 flex-none" />
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">📤 Active</span>
              <ArrowRight className="h-3 w-3 flex-none" />
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">✅ Completed</span>
              <span className="ml-3 hidden sm:block">Build in Draft · Send to make Active · Paused campaigns also live here · Completed = all emails delivered</span>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b overflow-x-auto">
              {[
                { id: 'drafts'    as const, label: 'Drafts',    icon: '📝', count: tabCounts.drafts    },
                { id: 'active'    as const, label: 'Active',    icon: '📤', count: tabCounts.active    },
                { id: 'completed' as const, label: 'Completed', icon: '✅', count: tabCounts.completed },
                { id: 'archived'  as const, label: 'Archived',  icon: '📦', count: tabCounts.archived  },
                { id: 'templates' as const, label: 'Templates', icon: '🗂️', count: null                },
                { id: 'triggers'  as const, label: 'Triggers',  icon: '⚡', count: null                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setSearchQuery('');
                    setDateFilter('all');
                  }}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                    currentTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.icon} {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <Badge className="h-4 min-w-4 px-1 text-[10px] font-semibold bg-primary/15 text-primary border-0">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              {/* Search/Filter Bar */}
              {(currentTab === 'drafts' || currentTab === 'active' || currentTab === 'completed' || currentTab === 'archived') && (
                <CampaignSearchFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  dateFilter={dateFilter}
                  onDateFilterChange={setDateFilter}
                  onClearFilters={handleClearFilters}
                />
              )}

              {/* Bulk Actions Bar */}
              {selectedIds.size > 0 && (currentTab === 'drafts' || currentTab === 'active' || currentTab === 'completed' || currentTab === 'archived') && (
                <CampaignBulkActionsBar
                  selectedCount={selectedIds.size}
                  variant={currentTab === 'archived' ? 'archived' : 'default'}
                  onDuplicate={handleDuplicateSelected}
                  onArchive={handleArchiveSelected}
                  onUnarchive={handleUnarchiveSelected}
                  onDelete={handleDeleteSelected}
                  onClearSelection={handleClearSelection}
                  isDuplicating={duplicateCampaign.isPending}
                  isArchiving={archiveCampaigns.isPending}
                  isUnarchiving={unarchiveCampaigns.isPending}
                  isDeleting={deleteBulk.isPending}
                />
              )}

              {/* Drafts Tab */}
              {currentTab === 'drafts' && (
                <CampaignsTabContent
                  campaigns={draftCampaigns}
                  isLoading={isLoading}
                  emptyMessage="No draft campaigns. Create one to get started."
                  onCampaignClick={setSelectedCampaign}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  showCheckboxes={true}
                />
              )}

              {/* Active Tab */}
              {currentTab === 'active' && (
                <CampaignsTabContent
                  campaigns={activeCampaigns}
                  isLoading={isLoading}
                  emptyMessage="No active campaigns. Send a draft to get started."
                  onCampaignClick={setSelectedCampaign}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  showCheckboxes={true}
                />
              )}

              {/* Completed Tab */}
              {currentTab === 'completed' && (
                <CampaignsTabContent
                  campaigns={completedCampaigns}
                  isLoading={isLoading}
                  emptyMessage="No completed campaigns yet."
                  onCampaignClick={setSelectedCampaign}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  showCheckboxes={true}
                />
              )}

              {/* Archived Tab */}
              {currentTab === 'archived' && (
                <CampaignsTabContent
                  campaigns={archivedCampaigns}
                  isLoading={isLoading}
                  emptyMessage="No archived campaigns. Archived campaigns appear here and can be restored."
                  onCampaignClick={setSelectedCampaign}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  showCheckboxes={true}
                />
              )}

              {/* Templates Tab */}
              {currentTab === 'templates' && <TemplatesGallery />}

              {/* Triggers Tab */}
              {currentTab === 'triggers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Triggers automatically create and send campaigns when contacts meet a behavioural condition.
                    </p>
                    <Button size="sm" onClick={() => setCreatingTrigger(true)} className="flex-none">
                      <Zap className="mr-1.5 h-3.5 w-3.5" /> New Trigger
                    </Button>
                  </div>
                  {triggers && triggers.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {triggers.map((t) => (
                        <TriggerCard key={t.id} trigger={t} />
                      ))}
                    </div>
                  ) : (
                    <Card className="flex flex-col items-center justify-center py-16 text-center">
                      <Zap className="mb-3 h-10 w-10 text-muted-foreground/50" />
                      <p className="font-medium">No triggers set up yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create a trigger to automatically re-engage inactive customers.
                      </p>
                      <Button className="mt-4" size="sm" onClick={() => setCreatingTrigger(true)}>
                        <Zap className="mr-1.5 h-3.5 w-3.5" /> Create First Trigger
                      </Button>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </CrmAccessGate>
        </div>

        {/* Create Campaign Dialog */}
        {creating && <CreateCampaign onClose={() => setCreating(false)} />}

        {/* Create Trigger Dialog */}
        <CreateTriggerDialog open={creatingTrigger} onClose={() => setCreatingTrigger(false)} />

        {/* Campaign Detail Modal */}
        <CampaignDetailModal
          campaign={selectedCampaign}
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSendClick={() => openAction('send')}
          onTestClick={() => openAction('test')}
        />

        {/* Send / Test Action Dialog */}
        <CampaignActionDialog
          campaign={actionCampaign}
          action={actionType}
          onClose={closeAction}
        />

      </AdminLayout>
    </RoleGuard>
  );
};

export default CrmCampaigns;
