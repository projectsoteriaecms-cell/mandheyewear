import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Target, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import {
  CrmAccessGate,
  RuleTreeBuilder,
  useCrmSegments,
  useSegmentRulesCount,
  useCreateSegment,
  useUpdateSegment,
  useDeleteSegment,
  type CrmSegment,
  type RuleTree,
} from "@/modules/crm";
import { CrmTabs } from "./CrmTabs";
import { RoleGuard } from "@/modules/auth";

const EMPTY_TREE: RuleTree = { type: "group", operator: "AND", conditions: [] };

// ── Editor dialog (create + edit) ───────────────────────────────────────────────

interface EditorState {
  id?:          string;
  name:         string;
  description:  string;
  rules:        RuleTree;
}

function SegmentEditor({
  state, onClose,
}: { state: EditorState | null; onClose: () => void }) {
  const [name, setName]   = useState(state?.name ?? "");
  const [desc, setDesc]   = useState(state?.description ?? "");
  const [rules, setRules] = useState<RuleTree>(state?.rules ?? EMPTY_TREE);

  const { data: count, isFetching: counting } = useSegmentRulesCount(rules);
  const create = useCreateSegment();
  const update = useUpdateSegment();
  const isPending = create.isPending || update.isPending;

  if (!state) return null;
  const isEdit = !!state.id;

  function save() {
    if (!name.trim()) return;
    if (isEdit) {
      update.mutate(
        { id: state!.id!, name: name.trim(), description: desc.trim() || null, rules_json: rules },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(
        { name: name.trim(), description: desc.trim() || null, rules_json: rules },
        { onSuccess: onClose },
      );
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit segment" : "New segment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. High-value buyers" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
              placeholder="Optional — what this audience is for" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rules</label>
            <RuleTreeBuilder value={rules} onChange={setRules} />
          </div>

          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            {counting ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Counting…
              </span>
            ) : (
              <span>
                Matches <strong className="tabular-nums">{(count ?? 0).toLocaleString()}</strong> live contacts
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!name.trim() || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create segment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────────

const CrmSegments = () => {
  const { data: segments, isLoading } = useCrmSegments();
  const del = useDeleteSegment();
  const [editor, setEditor]   = useState<EditorState | null>(null);
  const [deleting, setDeleting] = useState<CrmSegment | null>(null);

  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "branch_manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">CRM Segments</h1>
              <p className="text-muted-foreground">Reusable audiences built from contact rules.</p>
            </div>
            <Button onClick={() => setEditor({ name: "", description: "", rules: EMPTY_TREE })}>
              <Plus className="mr-2 h-4 w-4" /> New Segment
            </Button>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : segments && segments.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {segments.map((s) => (
                  <Card key={s.id} className="flex flex-col p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{s.name}</h3>
                      </div>
                      <Badge variant="secondary" className="tabular-nums">
                        {s.member_count.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
                      {s.description || "No description"}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm" className="flex-1"
                        onClick={() => setEditor({
                          id: s.id, name: s.name, description: s.description ?? "", rules: s.rules_json,
                        })}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(s)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <Target className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">No segments yet</p>
                <p className="mb-4 text-sm text-muted-foreground">Create your first audience to target campaigns.</p>
                <Button onClick={() => setEditor({ name: "", description: "", rules: EMPTY_TREE })}>
                  <Plus className="mr-2 h-4 w-4" /> New Segment
                </Button>
              </Card>
            )}
          </CrmAccessGate>
        </div>

        {editor && <SegmentEditor key={editor.id ?? "new"} state={editor} onClose={() => setEditor(null)} />}

        <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This can't be undone. Campaigns using this segment will block the delete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { if (deleting) del.mutate(deleting.id, { onSuccess: () => setDeleting(null) }); }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </RoleGuard>
  );
};

export default CrmSegments;
