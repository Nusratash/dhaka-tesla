import { FaresService } from '../src/fares/fares.service';
import { findZone } from '../src/zones/zones.data';

// Hand-verifiable against the README's documented formula:
//   passengerFare = baseFare + distanceCharge - poolDiscount
describe('FaresService', () => {
  const service = new FaresService();

  it('charges a solo rider the full distance charge with no pool discount', () => {
    const banani = findZone('Banani')!;
    const mohakhali = findZone('Mohakhali')!;
    const fare = service.calculate(banani, mohakhali, false);

    expect(fare.baseFarePoysha).toBe(3000);
    expect(fare.poolDiscountPoysha).toBe(0);
    expect(fare.totalFarePoysha).toBe(fare.baseFarePoysha + fare.distanceChargePoysha);
  });

  it('applies a 20% pool discount on the distance charge only, for Nusrat pooled with Rafiq', () => {
    const banani = findZone('Banani')!;
    const mohakhali = findZone('Mohakhali')!;
    const fare = service.calculate(banani, mohakhali, true);

    const expectedDiscount = Math.round(fare.distanceChargePoysha * 0.2);
    expect(fare.poolDiscountPoysha).toBe(expectedDiscount);
    expect(fare.totalFarePoysha).toBe(
      fare.baseFarePoysha + fare.distanceChargePoysha - fare.poolDiscountPoysha,
    );
  });

  it('never produces fractional poysha (integer money only)', () => {
    const dhanmondi = findZone('Dhanmondi')!;
    const uttara = findZone('Uttara')!;
    const fare = service.calculate(dhanmondi, uttara, true);

    expect(Number.isInteger(fare.baseFarePoysha)).toBe(true);
    expect(Number.isInteger(fare.distanceChargePoysha)).toBe(true);
    expect(Number.isInteger(fare.poolDiscountPoysha)).toBe(true);
    expect(Number.isInteger(fare.totalFarePoysha)).toBe(true);
  });
});
