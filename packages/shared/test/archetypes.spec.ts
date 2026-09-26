import { describe, it, expect } from 'vitest';
import { CULTURAL_ARCHETYPES_CATALOG } from '../src/constants/archetypes.constants';

describe('Cultural Archetypes Catalog (RF-011 & RNF-006)', () => {
  it('contiene exactamente 50 arquetipos de personajes culturales', () => {
    expect(CULTURAL_ARCHETYPES_CATALOG.length).toBe(50);
  });

  it('garantiza unicidad en los IDs de arquetipos', () => {
    const ids = CULTURAL_ARCHETYPES_CATALOG.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(50);
  });

  it('valida que todos los rasgos OCEAN estén calibrados entre 0 y 100', () => {
    CULTURAL_ARCHETYPES_CATALOG.forEach((archetype) => {
      const { traits } = archetype;
      expect(traits.openness).toBeGreaterThanOrEqual(0);
      expect(traits.openness).toBeLessThanOrEqual(100);
      expect(traits.conscientiousness).toBeGreaterThanOrEqual(0);
      expect(traits.conscientiousness).toBeLessThanOrEqual(100);
      expect(traits.extraversion).toBeGreaterThanOrEqual(0);
      expect(traits.extraversion).toBeLessThanOrEqual(100);
      expect(traits.agreeableness).toBeGreaterThanOrEqual(0);
      expect(traits.agreeableness).toBeLessThanOrEqual(100);
      expect(traits.neuroticism).toBeGreaterThanOrEqual(0);
      expect(traits.neuroticism).toBeLessThanOrEqual(100);
    });
  });

  it('contiene balance equilibrado entre personajes ficticios e históricos', () => {
    const fictional = CULTURAL_ARCHETYPES_CATALOG.filter((a) => a.type === 'fictional');
    const historical = CULTURAL_ARCHETYPES_CATALOG.filter((a) => a.type === 'historical');
    expect(fictional.length).toBe(25);
    expect(historical.length).toBe(25);
  });
});
