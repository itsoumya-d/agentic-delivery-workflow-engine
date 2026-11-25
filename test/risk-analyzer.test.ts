import { describe, it, expect } from "vitest";
import { RiskAnalyzer } from "../src/risk-analyzer.js";
import { DeliveryStage, ProjectArtifact } from "../src/types.js";

describe("RiskAnalyzer", () => {
  it("flags critical risk when E-Stop is unconfigured", () => {
    const artifact: ProjectArtifact = {
      id: "art-01",
      projectId: "proj-101",
      title: "Assembly Cell Specification",
      stage: DeliveryStage.TECH_SPECIFICATION,
      payload: {
        safetyEStopConfigured: false,
      },
      createdAt: Date.now(),
    };

    const risks = RiskAnalyzer.analyze(artifact);
    const critical = risks.find((r) => r.severity === "CRITICAL");
    expect(critical).toBeDefined();
    expect(critical?.rule).toBe("SAFETY_ESTOP_UNCONFIGURED");
  });

  it("flags high risk when payload exceeds rated arm capacity", () => {
    const artifact: ProjectArtifact = {
      id: "art-02",
      projectId: "proj-102",
      title: "Heavy Palletizing Setup",
      stage: DeliveryStage.TECH_SPECIFICATION,
      payload: {
        safetyEStopConfigured: true,
        requiresSafetyEStop: true,
        maxPayloadKg: 35,
        ratedCapacityKg: 20,
        cycleTimeSeconds: 12,
        cycleTimeTolerancePercent: 5,
      },
      createdAt: Date.now(),
    };

    const risks = RiskAnalyzer.analyze(artifact);
    const high = risks.find((r) => r.severity === "HIGH");
    expect(high).toBeDefined();
    expect(high?.rule).toBe("PAYLOAD_CAPACITY_EXCEEDED");
  });

  it("returns no critical or high risks for fully compliant cell spec", () => {
    const artifact: ProjectArtifact = {
      id: "art-03",
      projectId: "proj-103",
      title: "Compliant Welding Cell",
      stage: DeliveryStage.TECH_SPECIFICATION,
      payload: {
        safetyEStopConfigured: true,
        requiresSafetyEStop: true,
        maxPayloadKg: 15,
        ratedCapacityKg: 25,
        cycleTimeSeconds: 8,
        cycleTimeTolerancePercent: 2,
        powerSupplyVoltage: 400,
      },
      createdAt: Date.now(),
    };

    const risks = RiskAnalyzer.analyze(artifact);
    expect(risks.length).toBe(0);
  });
});
