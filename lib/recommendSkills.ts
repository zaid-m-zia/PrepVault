import rawRules from '../data/rules.json'

type AssociationRule = {
	antecedents: string[]
	consequents: string[]
	confidence: number
}

type RankedRecommendation = {
	skill: string
	confidence: number
}

function normalizeSkill(skill: string): string {
	return skill.trim().toLowerCase()
}

function isValidRule(value: unknown): value is AssociationRule {
	if (!value || typeof value !== 'object') return false

	const candidate = value as Partial<AssociationRule>

	return (
		Array.isArray(candidate.antecedents) &&
		Array.isArray(candidate.consequents) &&
		candidate.antecedents.every((item) => typeof item === 'string') &&
		candidate.consequents.every((item) => typeof item === 'string') &&
		typeof candidate.confidence === 'number' &&
		Number.isFinite(candidate.confidence)
	)
}

const rules: AssociationRule[] = Array.isArray(rawRules) ? rawRules.filter(isValidRule) : []

export function recommendSkills(userSkills: string[]): string[] {
	if (!Array.isArray(userSkills) || userSkills.length === 0) {
		return []
	}

	const normalizedUserSkills = userSkills
		.filter((skill): skill is string => typeof skill === 'string')
		.map(normalizeSkill)
		.filter(Boolean)

	if (normalizedUserSkills.length === 0) {
		return []
	}

	const userSkillSet = new Set(normalizedUserSkills)
	const recommendationsBySkill = new Map<string, number>()

	for (const rule of rules) {
		const normalizedAntecedents = rule.antecedents.map(normalizeSkill).filter(Boolean)
		const normalizedConsequents = rule.consequents.map(normalizeSkill).filter(Boolean)

		if (normalizedAntecedents.length === 0 || normalizedConsequents.length === 0) {
			continue
		}

		const antecedentsMatch = normalizedAntecedents.every((skill) => userSkillSet.has(skill))
		if (!antecedentsMatch) {
			continue
		}

		for (const skill of normalizedConsequents) {
			if (userSkillSet.has(skill)) {
				continue
			}

			const existingConfidence = recommendationsBySkill.get(skill) ?? Number.NEGATIVE_INFINITY
			if (rule.confidence > existingConfidence) {
				recommendationsBySkill.set(skill, rule.confidence)
			}
		}
	}

	const rankedRecommendations: RankedRecommendation[] = Array.from(recommendationsBySkill.entries()).map(
		([skill, confidence]) => ({ skill, confidence })
	)

	rankedRecommendations.sort((a, b) => {
		if (b.confidence !== a.confidence) {
			return b.confidence - a.confidence
		}

		return a.skill.localeCompare(b.skill)
	})

	return rankedRecommendations.slice(0, 5).map((item) => item.skill)
}
