export interface OceanTraits {
  readonly openness: number; // 0 a 100
  readonly conscientiousness: number; // 0 a 100
  readonly extraversion: number; // 0 a 100
  readonly agreeableness: number; // 0 a 100
  readonly neuroticism: number; // 0 a 100
}

export interface CulturalArchetype {
  readonly id: string;
  readonly name: string;
  readonly origin: string;
  readonly type: 'fictional' | 'historical';
  readonly affinityPercentage: number;
  readonly sharedTraits: readonly string[];
  readonly avatarUrl: string;
}
