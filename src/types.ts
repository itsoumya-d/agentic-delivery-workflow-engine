export enum DeliveryStage {
  REQUIREMENTS_REVIEW = "REQUIREMENTS_REVIEW",
  TECH_SPECIFICATION = "TECH_SPECIFICATION",
  RISK_EVALUATION = "RISK_EVALUATION",
  EXECUTION_GATE = "EXECUTION_GATE",
}

export enum GateStatus {
  PASSED = "PASSED",
  REVIEW_REQUIRED = "REVIEW_REQUIRED",
  BLOCKED = "BLOCKED",
}

export interface RiskSignal {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  rule: string;
  details: string;
}

export interface ProjectArtifact {
  id: string;
  projectId: string;
  title: string;
  stage: DeliveryStage;
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface EvaluationResult {
  gateStatus: GateStatus;
  qualityScore: number;
  risks: RiskSignal[];
  reasons: string[];
}

export interface HumanReviewApproval {
  reviewer: string;
  comments: string;
  approved: boolean;
  timestamp: number;
}
