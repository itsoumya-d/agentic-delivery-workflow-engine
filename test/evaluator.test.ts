import { describe, it, expect } from "vitest";
import { QualityEvaluator } from "../src/evaluator.js";
import { GateStatus, RiskSignal } from "../src/types.js";

describe("QualityEvaluator", () => {
  it("blocks transition when critical risk is present", () => {
    const risks: RiskSignal[] = [
      { severity: "CRITICAL", rule: "SAFETY_VIOLATION", details: "No hardware interlock" },
    ];
    const result = QualityEvaluator.evaluate(risks, true);
    expect(result.gateStatus).toBe(GateStatus.BLOCKED);
    expect(result.qualityScore).toBe(50);
  });

  it("requires review when high risk is present", () => {
    const risks: RiskSignal[] = [
      { severity: "HIGH", rule: "PAYLOAD_WARNING", details: "Close to threshold" },
    ];
    const result = QualityEvaluator.evaluate(risks, true);
    expect(result.gateStatus).toBe(GateStatus.REVIEW_REQUIRED);
    expect(result.qualityScore).toBe(75);
  });

  it("passes when all risks are cleared", () => {
    const result = QualityEvaluator.evaluate([], true);
    expect(result.gateStatus).toBe(GateStatus.PASSED);
    expect(result.qualityScore).toBe(100);
  });
});
