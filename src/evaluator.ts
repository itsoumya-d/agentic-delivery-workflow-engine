import { EvaluationResult, GateStatus, RiskSignal } from "./types.js";

export class QualityEvaluator {
  public static evaluate(risks: RiskSignal[], requiredFieldsPresent: boolean): EvaluationResult {
    let score = 100;

    for (const r of risks) {
      switch (r.severity) {
        case "CRITICAL":
          score -= 50;
          break;
        case "HIGH":
          score -= 25;
          break;
        case "MEDIUM":
          score -= 10;
          break;
        case "LOW":
          score -= 5;
          break;
      }
    }

    if (!requiredFieldsPresent) {
      score -= 20;
    }

    score = Math.max(0, Math.min(100, score));

    const reasons: string[] = [];
    let gateStatus = GateStatus.PASSED;

    const hasCritical = risks.some((r) => r.severity === "CRITICAL");
    const hasHigh = risks.some((r) => r.severity === "HIGH");

    if (hasCritical || score < 50) {
      gateStatus = GateStatus.BLOCKED;
      reasons.push("Critical safety violations or score below acceptable barrier (50).");
    } else if (hasHigh || score < 75) {
      gateStatus = GateStatus.REVIEW_REQUIRED;
      reasons.push("High-risk signals detected requiring human-in-the-loop review signoff.");
    } else {
      reasons.push("All autonomous quality and risk criteria passed.");
    }

    return {
      gateStatus,
      qualityScore: score,
      risks,
      reasons,
    };
  }
}
