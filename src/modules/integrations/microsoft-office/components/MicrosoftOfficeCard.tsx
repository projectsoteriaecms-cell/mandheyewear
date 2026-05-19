import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MicrosoftWordLogo,
  MicrosoftExcelLogo,
  MicrosoftOutlookLogo,
  MicrosoftPowerpointLogo,
  Download,
  ArrowSquareOut,
  Sparkle,
} from "@phosphor-icons/react";

const SUPPORTED_APPS = [
  { label: "Word", icon: MicrosoftWordLogo, color: "text-blue-600" },
  { label: "Excel", icon: MicrosoftExcelLogo, color: "text-green-600" },
  { label: "Outlook", icon: MicrosoftOutlookLogo, color: "text-blue-500" },
  { label: "PowerPoint", icon: MicrosoftPowerpointLogo, color: "text-orange-600" },
];

const FEATURES = [
  "Analyse & summarise documents",
  "Improve writing and grammar",
  "Generate formulas in Excel",
  "Draft and reply to emails",
  "Ask Claude anything in context",
];

interface MicrosoftOfficeCardProps {
  deployedUrl?: string;
}

export function MicrosoftOfficeCard({ deployedUrl }: MicrosoftOfficeCardProps) {
  const manifestUrl = deployedUrl
    ? `${deployedUrl}/office-addin-manifest.xml`
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow">
              <Sparkle className="h-5 w-5" weight="fill" />
            </div>
            <div>
              <CardTitle className="text-base">
                Claude AI for Microsoft Office
              </CardTitle>
              <CardDescription className="mt-0.5">
                Use Claude inside Word, Excel, Outlook, and PowerPoint
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Add-in</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Supported apps */}
        <div className="flex gap-3">
          {SUPPORTED_APPS.map(({ label, icon: Icon, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className={`h-5 w-5 ${color}`} weight="fill" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <ul className="space-y-1">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Install instructions */}
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          <p className="text-xs font-medium">How to install</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Open Word, Excel, or Outlook</li>
            <li>Go to Insert → Add-ins → My Add-ins</li>
            <li>Choose "Upload My Add-in" and select the manifest file</li>
            <li>The Claude panel will appear in the Home ribbon</li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {manifestUrl ? (
            <Button asChild className="flex-1">
              <a href={manifestUrl} download="soteria-claude-office-addin.xml">
                <Download className="h-4 w-4 mr-2" />
                Download Manifest
              </a>
            </Button>
          ) : (
            <Button disabled className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Deploy App to Enable
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href="/office-addin" target="_blank" rel="noreferrer">
              <ArrowSquareOut className="h-4 w-4 mr-1" />
              Preview
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
