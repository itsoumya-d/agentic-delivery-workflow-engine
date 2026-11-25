import { describe, it, expect } from "vitest";
import { AgenticPipelineOrchestrator } from "../src/pipeline-orchestrator.js";
import { DeliveryStage, ProjectArtifact } from "../src/types.js";

describe("AgenticPipelineOrchestrator", () => {
  it("advances stage automatically when compliant", () => {
    const orchestrator = new AgenticPipelineOrchestrator();
    const artifact: ProjectArtifact = {
      id: "art-clean-01",
      projectId: "proj-clean",
      title: "Verified Cell Spec",
      stage: DeliveryStage.REQUIREMENTS_REVIEW,
      payload: {
        safetyEStopConfigured: true,
        requiresSafetyEStop: true,
        maxPayloadKg: 10,
        ratedCapacityKg: 20,
        cycleTimeSeconds: 5,
        cycleTimeTolerancePercent: 2,
      },
      createdAt: Date.now(),
    };

    const res = orchestrator.advanceStage(artifact);
    expect(res.success).toBe(true);
    expect(res.nextStage).toBe(DeliveryStage.TECH_SPECIFICATION);
    expect(artifact.stage).toBe(DeliveryStage.TECH_SPECIFICATION);
  });

  it("pauses transition and requires human approval for high risk", () => {
    const orchestrator = new AgenticPipelineOrchestrator();
    const artifact: ProjectArtifact = {
      id: "art-review-01",
      projectId: "proj-heavy",
      title: "High Payload Cell",
      stage: DeliveryStage.TECH_SPECIFICATION,
      payload: {
        safetyEStopConfigured: true,
        requiresSafetyEStop: true,
        maxPayloadKg: 28,
        ratedCapacityKg: 20, // High risk
        cycleTimeSeconds: 15,
        cycleTimeTolerancePercent: 5,
      },
      createdAt: Date.now(),
    };

    // First attempt without human approval fails
    const res1 = orchestrator.advanceStage(artifact);
    expect(res1.success).toBe(false);
    expect(res1.error).toContain("human-in-the-loop signoff required");

    // Second attempt with human approval succeeds
    const res2 = orchestrator.advanceStage(artifact, {
      reviewer: "Lead Robotics Engineer",
      comments: "Reinforced arm structure verified on site; approved with counterweight.",
      approved: true,
      timestamp: Date.now(),
    });
    expect(res2.success).toBe(true);
    expect(res2.nextStage).toBe(DeliveryStage.RISK_EVALUATION);

    const history = orchestrator.getApprovalHistory(artifact.id);
    expect(history.length).toBe(1);
    expect(history[0].reviewer).toBe("Lead Robotics Engineer");
  });
});
