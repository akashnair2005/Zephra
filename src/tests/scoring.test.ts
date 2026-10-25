import { describe, it, expect } from 'vitest';
import { validateCandidateCompleteness, rankOutdoorCandidates, getPlannerLocations, groupRankedRecommendations } from '../utils/scoring';
import { CandidateSlot, LocationAirQualityState } from '../types';

describe('Scoring & Recommendation Engine', () => {
  const createLocation = (id: number, name: string): LocationAirQualityState => ({
    location: { id, name, latitude: id, longitude: id, timezone: 'UTC' },
    fetchedAt: '2026-10-25T00:00:00.000Z',
    timezone: 'UTC',
    utcOffsetSeconds: 0,
    hourlyUnits: {},
    hourlySlots: [],
    currentSlot: null,
    previousSlot: null,
    isLoading: false,
    error: null
  });

  const createMockCandidate = (
    name: string,
    isoTime: string,
    pm2_5: number | null,
    pm10: number | null = 20,
    no2: number | null = 15,
    o3: number | null = 45,
    so2: number | null = 5,
    co: number | null = 200
  ): CandidateSlot => ({
    locationId: 1,
    locationName: name,
    adminRegion: 'Sample Region',
    timezone: 'UTC',
    isoTime,
    formattedTime: isoTime.slice(11, 16),
    formattedDate: 'Today',
    pollutants: {
      pm2_5,
      pm10,
      nitrogen_dioxide: no2,
      ozone: o3,
      sulphur_dioxide: so2,
      carbon_monoxide: co
    },
    units: {},
    rawValues: {
      pm2_5,
      pm10,
      nitrogen_dioxide: no2,
      ozone: o3,
      sulphur_dioxide: so2,
      carbon_monoxide: co
    }
  });

  it('validates candidate completeness: rejects missing PM2.5', () => {
    const invalidCandidate = createMockCandidate('City A', '2026-10-24T12:00:00Z', null, 25, 10, 40);
    expect(validateCandidateCompleteness(invalidCandidate)).toBe(false);
  });

  it('validates candidate completeness: rejects when fewer than 3 pollutants exist', () => {
    const sparseCandidate = createMockCandidate('City A', '2026-10-24T12:00:00Z', 12.5, 25, null, null, null, null);
    expect(validateCandidateCompleteness(sparseCandidate)).toBe(false);
  });

  it('rejects negative pollutant readings', () => {
    const invalidCandidate = createMockCandidate('City A', '2026-10-24T12:00:00Z', -1, 25, 18);
    expect(validateCandidateCompleteness(invalidCandidate)).toBe(false);
  });

  it('accepts candidate meeting minimum requirements (PM2.5 + at least 2 others)', () => {
    const validCandidate = createMockCandidate('City A', '2026-10-24T12:00:00Z', 12.5, 25, 18, null, null, null);
    expect(validateCandidateCompleteness(validCandidate)).toBe(true);
  });

  it('does NOT convert missing pollutants to 0', () => {
    const candidate = createMockCandidate('City A', '2026-10-24T12:00:00Z', 10, 20, null, 30);
    const results = rankOutdoorCandidates([candidate]);
    expect(results.length).toBe(1);
    expect(results[0].candidate.pollutants.nitrogen_dioxide).toBeNull();
  });

  it('correctly ranks slot with comparatively lower pollution first', () => {
    const cleanSlot = createMockCandidate('Park A', '2026-10-24T10:00:00Z', 5.0, 10, 8, 30, 2, 100);
    const dirtySlot = createMockCandidate('Downtown B', '2026-10-24T10:00:00Z', 45.0, 80, 50, 95, 20, 900);

    const rankings = rankOutdoorCandidates([cleanSlot, dirtySlot]);
    expect(rankings.length).toBe(2);
    expect(rankings[0].rank).toBe(1);
    expect(rankings[0].candidate.locationName).toBe('Park A');
    expect(rankings[0].relativeScore).toBeLessThan(rankings[1].relativeScore);
  });

  it('handles deterministic tie-breaking on equal scores', () => {
    const slot1 = createMockCandidate('Location Alpha', '2026-10-24T08:00:00Z', 15.0, 30, 20, 50, 5, 200);
    const slot2 = createMockCandidate('Location Beta', '2026-10-24T14:00:00Z', 15.0, 30, 20, 50, 5, 200);

    const rankings = rankOutdoorCandidates([slot1, slot2]);
    expect(rankings.length).toBe(2);
    // Earlier timestamp breaks the tie
    expect(rankings[0].candidate.isoTime).toBe('2026-10-24T08:00:00Z');
  });

  it('generates an explainable text reason grounded in input values', () => {
    const slotA = createMockCandidate('Green Valley', '2026-10-24T07:00:00Z', 4.2, 8.0, 6.0, 22.0);
    const slotB = createMockCandidate('Industrial Port', '2026-10-24T07:00:00Z', 38.0, 65.0, 42.0, 80.0);

    const rankings = rankOutdoorCandidates([slotA, slotB]);
    expect(rankings[0].explanation).toContain('Ranked #1');
    expect(rankings[0].explanation).toContain('4.2 µg/m³');
  });

  it('scopes My Location mode to the primary location only', () => {
    const bengaluru = createLocation(1, 'Bengaluru');
    const chennai = createLocation(2, 'Chennai');
    expect(getPlannerLocations([bengaluru, chennai], 'primary')).toEqual([bengaluru]);
  });

  it('updates the scoped location when the primary location changes', () => {
    const bengaluru = createLocation(1, 'Bengaluru');
    const chennai = createLocation(2, 'Chennai');
    expect(getPlannerLocations([chennai, bengaluru], 'primary')[0].location.name).toBe('Chennai');
  });

  it('scopes Compare Selected Locations mode to explicit selections and groups results', () => {
    const bengaluru = createLocation(1, 'Bengaluru');
    const chennai = createLocation(2, 'Chennai');
    const candidates = [
      createMockCandidate('Bengaluru', '2026-10-25T10:00:00Z', 5),
      createMockCandidate('Chennai', '2026-10-25T11:00:00Z', 8)
    ];
    candidates[0].locationId = 1;
    candidates[1].locationId = 2;
    const rankings = rankOutdoorCandidates(candidates);
    const groups = groupRankedRecommendations(rankings);

    expect(getPlannerLocations([bengaluru, chennai], 'compare')).toEqual([bengaluru, chennai]);
    expect(groups.map(group => group.locationName).sort()).toEqual(['Bengaluru', 'Chennai']);
  });
});
