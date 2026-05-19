import { ClaudeTaskPane } from "@/modules/integrations/microsoft-office";

export default function OfficeAddin() {
  return (
    <div className="h-screen bg-background overflow-hidden">
      <ClaudeTaskPane />
    </div>
  );
}
