export { SegmentRetryButton } from "./components/SegmentRetryButton";
export { CrmAccessGate } from "./components/CrmAccessGate";
export { RankBadge, RankBadgeWithDetail } from "./components/RankBadge";

// Rule tree builder UI (T16)
export { RuleTreeBuilder } from "./components/RuleTreeBuilder/index";
export type { RuleTreeBuilderProps } from "./components/RuleTreeBuilder/index";
export {
  useSegmentEvalQueue,
  useSegmentEvalStatus,
  useEnqueueSegmentEval,
} from "./hooks/useSegmentEval";
export type { SegmentEvalJob, SegmentEvalStatus } from "./hooks/useSegmentEval";
export { useCrmRlsPreflight } from "./hooks/useCrmRlsPreflight";
export type { CrmPreflightResult, PreflightReason } from "./hooks/useCrmRlsPreflight";

// Campaign preview — live segment evaluation (T14)
export { useCampaignPreview } from "./hooks/useCampaignPreview";
export type { CampaignPreview } from "./hooks/useCampaignPreview";

// Campaign send hooks (T8 + T9)
export {
  useTriggerCampaignSend,
  useCampaignSendStatus,
  useScheduleCampaign,
} from "./hooks/useCampaignSend";
export type {
  CampaignStatus,
  CampaignSendProgress,
  TriggerResult,
} from "./hooks/useCampaignSend";

// Campaign controls + send quota (T15)
export {
  useSendQuotaStatus,
  usePauseCampaign,
  useResumeCampaign,
  useGlobalKillSwitch,
} from "./hooks/useCampaignControls";
export type { SendQuotaStatus } from "./hooks/useCampaignControls";

// Admin data hooks — contacts, segments, campaigns
export {
  useCrmContacts,
  useContactStats,
} from "./hooks/useCrmContacts";
export type {
  CrmContact,
  ContactFilter,
  ContactStats,
  UseCrmContactsParams,
} from "./hooks/useCrmContacts";
export {
  useAddCustomer,
} from "./hooks/useAddCustomer";
export type {
  AddCustomerInput,
  AddCustomerResponse,
} from "./hooks/useAddCustomer";
export {
  useCrmSegments,
  useSegmentRulesCount,
  useCreateSegment,
  useUpdateSegment,
  useDeleteSegment,
} from "./hooks/useCrmSegments";
export type { CrmSegment, SegmentInput } from "./hooks/useCrmSegments";
export {
  useCrmCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
} from "./hooks/useCrmCampaigns";
export type { CrmCampaign, CampaignInput } from "./hooks/useCrmCampaigns";

// WhatsApp channel (T20)
export {
  useWhatsAppChannel,
  useUpdateWhatsAppChannel,
  useTriggerWhatsAppSend,
} from "./hooks/useWhatsAppChannel";
export type {
  WhatsAppChannelConfig,
  WhatsAppChannelUpdate,
  WhatsAppTriggerResult,
} from "./hooks/useWhatsAppChannel";

// LTV + cohort analytics (T19)
export {
  LtvDashboard,
  LtvStatCards,
  MonthlyRevenueChart,
  LtvByChannelTable,
  CohortRetentionGrid,
} from "./components/LtvDashboard";
export {
  useLtvSummary,
  useLtvByChannel,
  useMonthlyRevenueTrend,
  useCohortGrid,
} from "./hooks/useLtvAnalytics";
export type {
  LtvSummary,
  LtvChannelRow,
  RevenueMonthRow,
  CohortGridRow,
} from "./hooks/useLtvAnalytics";

// Email preference centre (T18)
export { PreferenceCenterStats, PreferenceLinkCopier } from "./components/PreferenceCenterStats";
export {
  useEmailPreferenceStats,
  useContactPreferences,
  useContactPreferenceLink,
  useRotatePreferenceToken,
} from "./hooks/useEmailPreferences";
export type {
  PreferenceStat,
  ContactPreferenceRow,
} from "./hooks/useEmailPreferences";

// Re-engagement triggers (T17)
export { TriggerCard } from "./components/TriggerCard";
export {
  useReengagementTriggers,
  useFireTrigger,
  useToggleTrigger,
  useUpdateTrigger,
  triggerTypeLabel,
} from "./hooks/useReengagementTriggers";
export type {
  ReengagementTrigger,
  FireTriggerResult,
  TriggerType,
} from "./hooks/useReengagementTriggers";

// Customer ranking system (Phase 2)
export {
  useCustomerRank,
  useCustomerRanks,
  useRankHistory,
  useComputeAllRanks,
  RANK_LABELS,
} from "./hooks/useCustomerRanks";
export type {
  CustomerRank,
  RankHistoryEntry,
  UseCustomerRanksParams,
} from "./hooks/useCustomerRanks";

// Behavioral analytics (Phase 1 — event tracking + behavior analysis)
export {
  useUserJourney,
  useFeatureUsage,
  useProductAffinity,
  useFunnelAnalysis,
  useBehavioralSegments,
  useAtRiskUsers,
  useVtoConversionAnalysis,
  useTrackEvent,
  useComputeBehavioralSegments,
  useUpdateUserSegment,
} from "./hooks/useBehavioralAnalytics";
export type {
  UserJourneyEvent,
  FeatureUsage,
  ProductAffinity,
  FunnelStage,
  BehavioralSegment,
  AtRiskUser,
  VtoConversionMetric,
} from "./hooks/useBehavioralAnalytics";

// Rule tree types + compiler (T5)
export {
  validateRuleTree,
  isEmptyRuleTree,
  RuleValidationError,
  ALLOWED_FIELDS,
  ALLOWED_OPS,
} from "./lib/rule-tree";
export type {
  RuleTree,
  RuleNode,
  ConditionNode,
  GroupNode,
  AllowedField,
  AllowedOp,
  FieldDef,
} from "./lib/rule-tree";
export { compileRules } from "./lib/compile-rules";
