import { ALLOWED_TRANSITIONS, RideStatus } from '../src/common/enums/ride-status.enum';

describe('Ride lifecycle transitions', () => {
  it('allows the documented forward path', () => {
    expect(ALLOWED_TRANSITIONS[RideStatus.REQUESTED]).toContain(RideStatus.MATCHED);
    expect(ALLOWED_TRANSITIONS[RideStatus.MATCHED]).toContain(RideStatus.DRIVER_ARRIVED);
    expect(ALLOWED_TRANSITIONS[RideStatus.DRIVER_ARRIVED]).toContain(RideStatus.STARTED);
    expect(ALLOWED_TRANSITIONS[RideStatus.STARTED]).toContain(RideStatus.COMPLETED);
  });

  it('rejects skipping states (e.g. REQUESTED straight to STARTED)', () => {
    expect(ALLOWED_TRANSITIONS[RideStatus.REQUESTED]).not.toContain(RideStatus.STARTED);
    expect(ALLOWED_TRANSITIONS[RideStatus.REQUESTED]).not.toContain(RideStatus.COMPLETED);
  });

  it('rejects any transition out of a terminal state', () => {
    expect(ALLOWED_TRANSITIONS[RideStatus.COMPLETED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[RideStatus.CANCELLED]).toHaveLength(0);
  });

  it('only allows cancellation before the ride has STARTED', () => {
    expect(ALLOWED_TRANSITIONS[RideStatus.REQUESTED]).toContain(RideStatus.CANCELLED);
    expect(ALLOWED_TRANSITIONS[RideStatus.DRIVER_ARRIVED]).toContain(RideStatus.CANCELLED);
    expect(ALLOWED_TRANSITIONS[RideStatus.STARTED]).not.toContain(RideStatus.CANCELLED);
  });
});
