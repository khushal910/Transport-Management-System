import { describe, expect, it } from 'vitest';
import { githubDocsCatalog } from '@/data/githubDocsCatalog';
import { documentationById } from '@/data/documentationContent';

describe('documentation content coverage', () => {
  it('has detailed content for every catalog topic', () => {
    for (const catalogEntry of githubDocsCatalog) {
      const article = documentationById[catalogEntry.id];
      expect(article).toBeDefined();
      expect(article.title.length).toBeGreaterThan(3);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.bestPractices.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps docs route convention aligned with topic ids', () => {
    for (const catalogEntry of githubDocsCatalog) {
      expect(catalogEntry.routePath).toBe(`/docs/${catalogEntry.id}`);
    }
  });
});
