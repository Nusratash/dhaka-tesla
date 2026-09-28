import { PoolingService } from '../src/rides/pooling.service';

// Matching rule (README section 4): same pickup zone AND destination zones
// share a corridor. Verified against the exact story cast.
describe('PoolingService - matching rule', () => {
  const service = new PoolingService();

  const nusrat = { pickupZone: 'Banani', destinationZone: 'Mohakhali' };
  const rafiq = { pickupZone: 'Banani', destinationZone: 'Gulshan 1' };
  const shirinDifferentRoute = { pickupZone: 'Banani', destinationZone: 'Mirpur' };
  const shirinDifferentPickup = { pickupZone: 'Dhanmondi', destinationZone: 'Mohakhali' };

  it('pools Nusrat (Banani->Mohakhali) with Rafiq (Banani->Gulshan 1): same pickup, same corridor', () => {
    expect(service.isCompatible(nusrat, rafiq)).toBe(true);
  });

  it('does not pool a request whose destination is outside the corridor', () => {
    expect(service.isCompatible(nusrat, shirinDifferentRoute)).toBe(false);
  });

  it('does not pool a request from a different pickup zone', () => {
    expect(service.isCompatible(nusrat, shirinDifferentPickup)).toBe(false);
  });

  it('isCompatibleWithPool requires compatibility with every existing rider', () => {
    expect(service.isCompatibleWithPool(rafiq, [nusrat])).toBe(true);
    expect(service.isCompatibleWithPool(shirinDifferentRoute, [nusrat, rafiq])).toBe(false);
  });
});
