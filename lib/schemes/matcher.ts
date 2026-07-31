export interface SchemeRules {
  maxLandAcres?: number;
  states?: string[];
  categories?: string[];
  crops?: string[];
}

export interface FarmerProfile {
  state: string;
  landSizeAcres: number;
  category: string;
  crops?: string[];
}

export interface MatchResult {
  eligible: boolean;
  score: number; // 0 to 100
  reasons: string[];
}

/**
 * Deterministically evaluates farmer eligibility for a government scheme
 */
export function evaluateSchemeEligibility(
  rulesJson: string,
  farmer: FarmerProfile
): MatchResult {
  const reasons: string[] = [];
  let score = 100;
  let eligible = true;

  try {
    const rules: SchemeRules = JSON.parse(rulesJson);

    let totalRulesCount = 0;
    let satisfiedRulesCount = 0;

    // 1. Evaluate State Rule (Hard Constraint)
    if (rules.states && rules.states.length > 0) {
      totalRulesCount++;
      if (rules.states.includes(farmer.state)) {
        satisfiedRulesCount++;
        reasons.push(`Matches eligible state: ${farmer.state}`);
      } else {
        eligible = false;
        reasons.push(`Only available in: ${rules.states.join(', ')} (your state is ${farmer.state})`);
      }
    }

    // 2. Evaluate Land Size Rule (Hard Constraint)
    if (rules.maxLandAcres !== undefined && rules.maxLandAcres !== null) {
      totalRulesCount++;
      if (farmer.landSizeAcres <= rules.maxLandAcres) {
        satisfiedRulesCount++;
        reasons.push(`Land size (${farmer.landSizeAcres} ac) is within limits (max ${rules.maxLandAcres} ac)`);
      } else {
        eligible = false;
        reasons.push(`Land size (${farmer.landSizeAcres} ac) exceeds maximum limit of ${rules.maxLandAcres} ac`);
      }
    }

    // 3. Evaluate Category Rule (Hard Constraint)
    if (rules.categories && rules.categories.length > 0) {
      totalRulesCount++;
      if (rules.categories.includes(farmer.category)) {
        satisfiedRulesCount++;
        reasons.push(`Belongs to eligible category: ${farmer.category}`);
      } else {
        eligible = false;
        reasons.push(`Category ${farmer.category} is not listed in eligible groups`);
      }
    }

    // 4. Evaluate Crop Rule (Soft / Match multiplier)
    if (rules.crops && rules.crops.length > 0) {
      totalRulesCount++;
      if (farmer.crops && farmer.crops.length > 0) {
        const hasMatchingCrop = farmer.crops.some((c) => rules.crops!.includes(c));
        if (hasMatchingCrop) {
          satisfiedRulesCount++;
          reasons.push(`Growing eligible crop matching: ${rules.crops.join(', ')}`);
        } else {
          reasons.push(`Requires crops like: ${rules.crops.join(', ')}`);
        }
      } else {
        reasons.push(`Requires crops like: ${rules.crops.join(', ')}`);
      }
    }

    // Calculate score
    if (!eligible) {
      score = 0;
    } else {
      score = totalRulesCount > 0 ? Math.round((satisfiedRulesCount / totalRulesCount) * 100) : 100;
    }
  } catch (error) {
    // If parsing fails, fall back to default pass
    score = 100;
    eligible = true;
    reasons.push('Implicit eligibility - rules schema pending curation.');
  }

  return {
    eligible: eligible && score >= 50,
    score,
    reasons
  };
}
