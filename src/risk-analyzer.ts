import { ProjectArtifact, RiskSignal } from "./types.js";

export class RiskAnalyzer {
  public static analyze(artifact: ProjectArtifact): RiskSignal[] {
    const risks: RiskSignal[] = [];
    const p = artifact.payload;

    // 1. Safety envelope & Emergency Stop check
    if (p.requiresSafetyEStop === undefined || p.safetyEStopConfigured === false) {
      risks.push({
        severity: "CRITICAL",
        rule: "SAFETY_ESTOP_UNCONFIGURED",
        details: "Emergency stop and hardware interlock configuration missing in cell spec.",
      });
    }

    // 2. Physical payload and reach bounds
    const maxPayloadKg = typeof p.maxPayloadKg === "number" ? p.maxPayloadKg : 0;
    const ratedCapacityKg = typeof p.ratedCapacityKg === "number" ? p.ratedCapacityKg : 25;

    if (maxPayloadKg > ratedCapacityKg) {
      risks.push({
        severity: "HIGH",
        rule: "PAYLOAD_CAPACITY_EXCEEDED",
        details: `Requested payload (${maxPayloadKg}kg) exceeds rated robotic arm capacity (${ratedCapacityKg}kg).`,
      });
    }

    // 3. Cycle time tolerance specifications
    if (!p.cycleTimeSeconds || !p.cycleTimeTolerancePercent) {
      risks.push({
        severity: "MEDIUM",
        rule: "AMBIGUOUS_CYCLE_TIME_TOLERANCE",
        details: "Cycle time target specified without formal variance tolerance thresholds.",
      });
    }

    // 4. Power & Pneumatics supply check
    if (p.powerSupplyVoltage && ![230, 400].includes(Number(p.powerSupplyVoltage))) {
      risks.push({
        severity: "LOW",
        rule: "NON_STANDARD_POWER_SUPPLY",
        details: `Factory power supply (${p.powerSupplyVoltage}V) requires step transformer verification.`,
      });
    }

    return risks;
  }
}
