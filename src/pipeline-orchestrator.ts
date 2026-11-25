import { DeliveryStage, EvaluationResult, GateStatus, HumanReviewApproval, ProjectArtifact } from "./types.js";
import { RiskAnalyzer } from "./risk-analyzer.js";
import { QualityEvaluator } from "./evaluator.js";

export class AgenticPipelineOrchestrator {
  private readonly approvalHistory: Map<string, HumanReviewApproval[]> = new Map();

  public evaluateArtifact(artifact: ProjectArtifact): EvaluationResult {
    const risks = RiskAnalyzer.analyze(artifact);
    const hasRequiredFields = Boolean(artifact.title && artifact.projectId && artifact.payload);
    return QualityEvaluator.evaluate(risks, hasRequiredFields);
  }

  public advanceStage(
    artifact: ProjectArtifact,
    humanApproval?: HumanReviewApproval
  ): { success: boolean; nextStage?: DeliveryStage; error?: string } {
    const evaluation = this.evaluateArtifact(artifact);

    if (evaluation.gateStatus === GateStatus.BLOCKED) {
      return {
        success: false,
        error: `Artifact blocked by policy engine: ${evaluation.reasons.join(", ")}`,
      };
    }

    if (evaluation.gateStatus === GateStatus.REVIEW_REQUIRED) {
      if (!humanApproval || !humanApproval.approved) {
        return {
          success: false,
          error: "Stage transition paused: human-in-the-loop signoff required for high-risk delivery parameters.",
        };
      }

      // Record approval in audit history
      const history = this.approvalHistory.get(artifact.id) || [];
      history.push(humanApproval);
      this.approvalHistory.set(artifact.id, history);
    }

    const stageOrder = [
      DeliveryStage.REQUIREMENTS_REVIEW,
      DeliveryStage.TECH_SPECIFICATION,
      DeliveryStage.RISK_EVALUATION,
      DeliveryStage.EXECUTION_GATE,
    ];

    const currentIndex = stageOrder.indexOf(artifact.stage);
    if (currentIndex < 0 || currentIndex === stageOrder.length - 1) {
      return { success: true, nextStage: artifact.stage }; // Terminal stage reached
    }

    const nextStage = stageOrder[currentIndex + 1];
    artifact.stage = nextStage;
    return { success: true, nextStage };
  }

  public getApprovalHistory(artifactId: string): HumanReviewApproval[] {
    return this.approvalHistory.get(artifactId) || [];
  }
}
