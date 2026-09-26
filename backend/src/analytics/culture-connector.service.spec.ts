import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { CultureConnectorService } from './culture-connector.service';
import { OceanTraits } from '@soundtrack-timeline/shared';

vi.mock('axios');

describe('CultureConnectorService', () => {
  let service: CultureConnectorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CultureConnectorService();
  });

  describe('matchCulturalArchetype', () => {
    it('empareja un perfil de alta apertura y neuroticismo con un arquetipo afín', () => {
      const traits: OceanTraits = {
        openness: 85,
        conscientiousness: 35,
        extraversion: 75,
        agreeableness: 30,
        neuroticism: 80,
      };

      const matched = service.matchCulturalArchetype(traits);

      expect(matched).toBeDefined();
      expect(matched.affinityPercentage).toBeGreaterThanOrEqual(90);
      expect(matched.name).toBe('Tyler Durden');
      expect(matched.sharedTraits.length).toBeGreaterThan(0);
    });

    it('empareja un perfil científico y metódico con un arquetipo intelectual', () => {
      const traits: OceanTraits = {
        openness: 90,
        conscientiousness: 95,
        extraversion: 25,
        agreeableness: 35,
        neuroticism: 40,
      };

      const matched = service.matchCulturalArchetype(traits);

      expect(matched).toBeDefined();
      expect(matched.affinityPercentage).toBeGreaterThanOrEqual(85);
      expect(matched.name).toBe('Sherlock Holmes');
    });
  });

  describe('recommendBook', () => {
    const dummyTraits: OceanTraits = {
      openness: 70,
      conscientiousness: 70,
      extraversion: 70,
      agreeableness: 70,
      neuroticism: 70,
    };

    it('recomienda un libro dinámicamente cuando Open Library responde con éxito', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          docs: [
            {
              title: 'Do Androids Dream of Electric Sheep?',
              author_name: ['Philip K. Dick'],
              cover_i: 123456,
              key: '/works/OL1234W',
            },
          ],
        },
      });

      const book = await service.recommendBook('aire', dummyTraits);

      expect(book.title).toBe('Do Androids Dream of Electric Sheep?');
      expect(book.author).toBe('Philip K. Dick');
      expect(book.coverUrl).toBe('https://covers.openlibrary.org/b/id/123456-L.jpg');
      expect(book.openLibraryKey).toBe('/works/OL1234W');
      expect(book.matchedMood).toBe('Neón & Trascendencia');
    });

    it('aplica literatura editorial curada de fallback ante fallo o timeout de Open Library', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Connection timed out'));

      const book = await service.recommendBook('fuego', dummyTraits);

      expect(book.title).toBe('Fahrenheit 451');
      expect(book.author).toBe('Ray Bradbury');
      expect(book.coverUrl).toBe('https://covers.openlibrary.org/b/id/10531238-L.jpg');
      expect(book.openLibraryKey).toBe('/works/OL27479W');
      expect(book.matchedMood).toBe('Resistencia & Catarsis');
    });
  });
});
