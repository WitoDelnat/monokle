export const makeApplyKustomizationText = (name: string, context: string | undefined) =>
  `Deploy ${name} kustomization to cluster [${context || ''}]?`;

export const makeApplyResourceText = (name: string, context: string | undefined) =>
  `Deploy ${name} to cluster [${context || ''}]?`;

export const makeApplyMultipleResourcesText = (length: number, context: string | undefined) =>
  `Deploy selected resources (${length}) to cluster [${context || ''}]?`;
