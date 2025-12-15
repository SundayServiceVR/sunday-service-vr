import { describe, it, expect } from 'vitest';
import { hasAvailabilityConflict } from './util';
import { SlotType, type EventSignup, type Slot, type SlotDuration } from '../../util/types';

/**
 * Helper to create a Date on an arbitrary consistent day with just an hour/minute.
 */
const makeTime = (hours: number, minutes: number = 0) => {
  const d = new Date(2024, 0, 1, hours, minutes, 0, 0);
  return d;
};

const baseSignup = (overrides: Partial<EventSignup> = {}): EventSignup => ({
  uuid: 'signup-1',
  name: 'Test DJ',
  is_debut: false,
  dj_refs: [],
  requested_duration: 1 as SlotDuration,
  type: SlotType.LIVE,
  event_signup_form_data: {
    event_id: 'event-1',
    available_from: makeTime(20, 0),
    available_to: makeTime(22, 0),
    requested_duration: 1 as SlotDuration,
    type: SlotType.LIVE,
  },
  ...overrides,
});

const baseSlot = (overrides: Partial<Slot> = {}): Slot => ({
  dj_ref: { id: 'dj1' } as unknown as Slot['dj_ref'],
  signup_uuid: 'signup-1',
  duration: 1 as SlotDuration,
  start_time: makeTime(21, 0),
  stream_source_url: 'https://example.com',
  reconciled: { signup: baseSignup() },
  ...overrides,
});

describe('hasAvailabilityConflict', () => {
  it('returns false when no availability data is present', () => {
    const signup = baseSignup({ event_signup_form_data: undefined });
    const slot = baseSlot();
    expect(hasAvailabilityConflict(slot, signup)).toBe(false);
  });

  it('returns false when availability is "any" on either bound', () => {
    const signupAnyFrom = baseSignup({
      event_signup_form_data: {
        ...(baseSignup().event_signup_form_data!),
        available_from: 'any',
      },
    });

    const signupAnyTo = baseSignup({
      event_signup_form_data: {
        ...(baseSignup().event_signup_form_data!),
        available_to: 'any',
      },
    });

    const slot = baseSlot();

    expect(hasAvailabilityConflict(slot, signupAnyFrom)).toBe(false);
    expect(hasAvailabilityConflict(slot, signupAnyTo)).toBe(false);
  });

  it('returns false when slot is fully inside availability window (start and end inclusive)', () => {
    const signup = baseSignup();
    // 20:00-22:00 availability, 21:00-22:00 slot
  const slot = baseSlot({ start_time: makeTime(21, 0), duration: 1 as SlotDuration });
    expect(hasAvailabilityConflict(slot, signup)).toBe(false);
  });

  it('returns false when slot ends exactly at availability end time', () => {
    const signup = baseSignup();
    // 20:00-22:00 availability, 21:30-22:00 slot (0.5 hours)
  const slot = baseSlot({ start_time: makeTime(21, 30), duration: 0.5 as SlotDuration });
    expect(hasAvailabilityConflict(slot, signup)).toBe(false);
  });

  it('returns true when slot starts before availability window', () => {
    const signup = baseSignup();
    // 20:00-22:00 availability, 19:30-20:30 slot
  const slot = baseSlot({ start_time: makeTime(19, 30), duration: 1 as SlotDuration });
    expect(hasAvailabilityConflict(slot, signup)).toBe(true);
  });

  it('returns true when slot ends after availability window', () => {
    const signup = baseSignup();
    // 20:00-22:00 availability, 21:30-22:30 slot
  const slot = baseSlot({ start_time: makeTime(21, 30), duration: 1 as SlotDuration });
    expect(hasAvailabilityConflict(slot, signup)).toBe(true);
  });

  it('returns false when slot has no start_time', () => {
    const signup = baseSignup();
  const slot = baseSlot({ start_time: undefined as unknown as Date });
    expect(hasAvailabilityConflict(slot, signup)).toBe(false);
  });

  it('returns false when availability values are not Dates', () => {
    const signup = baseSignup({
      event_signup_form_data: {
        ...(baseSignup().event_signup_form_data!),
        available_from: 'not-a-date' as unknown as Date,
        available_to: 'also-not-a-date' as unknown as Date,
      },
    });
    const slot = baseSlot();
    expect(hasAvailabilityConflict(slot, signup)).toBe(false);
  });
});
