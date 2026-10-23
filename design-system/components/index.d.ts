/** POL components. Load React 18, tokens.css, bundle.css, then bundle.js → window.POL. */
import type { ReactNode } from "react";

export type ClaimLabel = "announced" | "reported" | "verified" | "disputed";
export type ScoreConfidence = "high" | "medium" | "low" | "insufficient";

export interface AppHeaderProps { links?: { label: string; href: string }[]; current?: string; homeHref?: string; children?: ReactNode }
export interface BannerProps { children: ReactNode }
export interface ButtonProps { variant?: "primary" | "secondary" | "ghost"; size?: "md" | "sm"; pressed?: boolean; disabled?: boolean; type?: "button" | "submit"; title?: string; onClick?: () => void; children: ReactNode }
export interface TagProps { children: ReactNode }
export interface ConfidencePillProps { label: ClaimLabel }
export interface PerformanceScoreProps { value: number | null; confidence: ScoreConfidence }
export interface ApprovalBarProps { pct: number | null; residents: number; low?: boolean }
export interface LeaderCardProps { name: string; party?: string; officeTitle: string; inOffice?: string; href?: string; performance: number | null; confidence: ScoreConfidence; approvePct: number | null; verifiedResidents: number; lowSample?: boolean }
export interface NewsCardProps { headline: string; summary: string; topic?: string; confidenceLabel: ClaimLabel; date?: string; href?: string; officials?: { name: string; href?: string }[]; sourceCount: number; aiGenerated?: boolean; reactionCounts?: Partial<Record<"up" | "down" | "impactful" | "disputed" | "evidence", number>>; mine?: string[]; reactions?: boolean }
export interface ReactionBarProps { counts?: Partial<Record<"up" | "down" | "impactful" | "disputed" | "evidence", number>>; mine?: string[]; onToggle?: (type: string, on: boolean) => void }
export interface FieldProps { label: string; id?: string; options?: (string | { value: string; label: string })[]; value?: string; defaultValue?: string; placeholder?: string; disabled?: boolean; hint?: string; error?: string; onChange?: (e: unknown) => void }

export declare function AppHeader(p: AppHeaderProps): JSX.Element;
export declare function Banner(p: BannerProps): JSX.Element;
export declare function Button(p: ButtonProps): JSX.Element;
export declare function Tag(p: TagProps): JSX.Element;
export declare function ConfidencePill(p: ConfidencePillProps): JSX.Element;
export declare function PerformanceScore(p: PerformanceScoreProps): JSX.Element;
export declare function ApprovalBar(p: ApprovalBarProps): JSX.Element;
export declare function LeaderCard(p: LeaderCardProps): JSX.Element;
export declare function NewsCard(p: NewsCardProps): JSX.Element;
export declare function ReactionBar(p: ReactionBarProps): JSX.Element;
export declare function Field(p: FieldProps): JSX.Element;
