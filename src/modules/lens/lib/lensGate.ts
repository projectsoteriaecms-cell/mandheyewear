import { NEEDS_PRESCRIPTION, REQUIRES_FITTING, type LensType } from "../constants";

export type PrescriptionStatus = "valid" | "expired" | "none";

export type GateDecision =
  | { action: "allow" }
  | { action: "recommend_test"; reason: string }
  | { action: "require_booking"; reason: string; service: string };

/**
 * Determines what gate (if any) to apply when a customer selects a lens type
 * and a prescription status is known.
 *
 * Rules:
 *  - Plano / frame-only              → always allow
 *  - Single vision + valid Rx        → allow
 *  - Single vision + expired Rx      → soft gate: recommend fresh test
 *  - Single vision + no Rx           → soft gate: recommend booking
 *  - Strong Rx (high_index)          → soft nudge toward consultation
 *  - Bifocal / progressive / prism   → hard gate: must book fitting
 */
export function evaluateLensGate(
  lensType: LensType,
  rxStatus: PrescriptionStatus,
  sphereMax?: number,   // absolute value of the strongest sphere power
  cylMax?: number       // absolute value of the strongest cylinder power
): GateDecision {
  // No prescription needed — wave through
  if (!NEEDS_PRESCRIPTION[lensType]) {
    return { action: "allow" };
  }

  // Hard gate: fitting mandatory in-clinic
  if (REQUIRES_FITTING[lensType]) {
    const label =
      lensType === "bifocal"     ? "Bifocal" :
      lensType === "progressive" ? "Progressive (Varifocal)" :
      "Specialty";
    return {
      action: "require_booking",
      service: "lens_fitting_consultation",
      reason:
        `${label} lenses require precise in-clinic measurements — ` +
        `pupillary distance, fitting height, and frame alignment — ` +
        `that cannot be done remotely. Book a fitting consultation ` +
        `and we'll order your lenses together.`,
    };
  }

  // High-index: soft nudge if very strong Rx
  if (lensType === "high_index") {
    if (rxStatus === "none") {
      return {
        action: "recommend_test",
        reason:
          "High-index lenses are designed for strong prescriptions. " +
          "You'll need a current prescription — book a free basic eye test or a " +
          "comprehensive exam to get yours.",
      };
    }
    if (rxStatus === "expired") {
      return {
        action: "recommend_test",
        reason:
          "Your saved prescription may be outdated. We recommend a fresh eye " +
          "test before ordering high-index lenses — your power may have changed.",
      };
    }
    // Very strong Rx — nudge toward consultation even with valid Rx
    if ((sphereMax ?? 0) > 6 || (cylMax ?? 0) > 2) {
      return {
        action: "recommend_test",
        reason:
          "With a prescription this strong we recommend a quick in-person " +
          "consultation to confirm the best lens index and ensure optimal clarity.",
      };
    }
    return { action: "allow" };
  }

  // Single vision cases
  if (rxStatus === "valid") {
    return { action: "allow" };
  }

  if (rxStatus === "expired") {
    return {
      action: "recommend_test",
      reason:
        "Your saved prescription is more than 2 years old — vision can change " +
        "significantly in that time. We recommend a fresh test before ordering. " +
        "Our basic eye test is FREE, and a comprehensive exam (₦10,000–₦25,000) " +
        "includes a full ocular health screening.",
    };
  }

  // rxStatus === "none"
  return {
    action: "recommend_test",
    reason:
      "Prescription lenses require a valid, current prescription (less than " +
      "2 years old). You can enter your prescription details manually, upload " +
      "a photo of your prescription, or book one of our eye tests.",
  };
}

/** Returns true when the Rx data is considered a strong prescription */
export function isStrongPrescription(rxData: {
  right_eye?: { sph?: number; cyl?: number } | null;
  left_eye?:  { sph?: number; cyl?: number } | null;
}): boolean {
  const values = [
    rxData.right_eye?.sph,
    rxData.right_eye?.cyl,
    rxData.left_eye?.sph,
    rxData.left_eye?.cyl,
  ].filter((v): v is number => v !== undefined && v !== null);
  return values.some((v) => Math.abs(v) > 4);
}
