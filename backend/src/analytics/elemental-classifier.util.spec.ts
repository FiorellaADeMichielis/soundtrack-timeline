import { describe, expect, it } from 'vitest';
import { OceanTraits, RankedArtist } from '@soundtrack-timeline/shared';
import { classifyElementalArchetype } from './elemental-classifier.util';

describe('elemental-classifier.util', () => {
  const createMockArtist = (name: string, genres: string[]): RankedArtist => ({
    id: `art_${name}`,
    name,
    imageUrl: 'https://example.com/artist.jpg',
    genres,
    timeMetric: {
      mode: 'verified_play_time',
      totalMinutes: 30,
      formattedTime: '30 min',
      trackCount: 3,
      legend: 'Rotación',
    },
  });

  it('clasifica como Fuego cuando predomina alta tensión y géneros post-punk/rock', () => {
    const traits: OceanTraits = {
      openness: 65,
      conscientiousness: 40,
      extraversion: 70,
      agreeableness: 35,
      neuroticism: 85,
    };

    const artists = [
      createMockArtist('Joy Division', ['post-punk', 'dark wave']),
      createMockArtist('The Stooges', ['punk rock']),
    ];

    const result = classifyElementalArchetype(traits, artists);

    expect(result.primaryElement).toBe('fuego');
    expect(result.dominancePercentage).toBeGreaterThanOrEqual(68);
    expect(result.dominancePercentage).toBeLessThanOrEqual(95);
    expect(result.title).toContain('Fuego');
  });

  it('clasifica como Tierra cuando predomina alta responsabilidad y géneros folk/acústicos', () => {
    const traits: OceanTraits = {
      openness: 60,
      conscientiousness: 85,
      extraversion: 40,
      agreeableness: 80,
      neuroticism: 25,
    };

    const artists = [
      createMockArtist('Nick Drake', ['folk', 'acoustic']),
      createMockArtist('Fleet Foxes', ['indie folk', 'americana']),
    ];

    const result = classifyElementalArchetype(traits, artists);

    expect(result.primaryElement).toBe('tierra');
    expect(result.title).toContain('Tierra');
  });

  it('clasifica como Aire cuando predomina alta apertura y géneros synthwave/electrónicos', () => {
    const traits: OceanTraits = {
      openness: 90,
      conscientiousness: 45,
      extraversion: 75,
      agreeableness: 60,
      neuroticism: 40,
    };

    const artists = [
      createMockArtist('Kavinsky', ['synthwave', 'electronic']),
      createMockArtist('Daft Punk', ['french house', 'electronic']),
    ];

    const result = classifyElementalArchetype(traits, artists);

    expect(result.primaryElement).toBe('aire');
    expect(result.title).toContain('Aire');
  });

  it('clasifica como Agua cuando predomina melancolía reflexiva y géneros dream pop/shoegaze', () => {
    const traits: OceanTraits = {
      openness: 85,
      conscientiousness: 45,
      extraversion: 30,
      agreeableness: 85,
      neuroticism: 80,
    };

    const artists = [
      createMockArtist('Cocteau Twins', ['dream pop', 'shoegaze']),
      createMockArtist('Slowdive', ['shoegaze', 'sadcore']),
    ];

    const result = classifyElementalArchetype(traits, artists);

    expect(result.primaryElement).toBe('agua');
    expect(result.title).toContain('Agua');
  });
});
