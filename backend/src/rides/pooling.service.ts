import { Injectable } from '@nestjs/common';
import { findZone } from '../zones/zones.data';

// The documented matching rule (brief, section 4):
//   Two requests are poolable if they share the same pickup zone AND their
//   destination zones fall in the same "corridor" (a small predefined
//   group of nearby Dhaka areas - see zones.data.ts).
//
// Applied to the story: Nusrat (Banani -> Mohakhali) and Rafiq
// (Banani -> Gulshan 1) share pickup zone "Banani", and Mohakhali/Gulshan 1
// are both in the "gulshan-banani-mohakhali" corridor, so they pool.
@Injectable()
export class PoolingService {
  isCompatible(a: { pickupZone: string; destinationZone: string }, b: { pickupZone: string; destinationZone: string }): boolean {
    if (a.pickupZone.toLowerCase() !== b.pickupZone.toLowerCase()) return false;

    const destA = findZone(a.destinationZone);
    const destB = findZone(b.destinationZone);
    if (!destA || !destB) return false;

    return destA.corridor === destB.corridor;
  }

  // A candidate pool is joinable if every already-seated request in it is
  // compatible with the incoming one - keeps pools coherent even at 3+ riders.
  isCompatibleWithPool(incoming: { pickupZone: string; destinationZone: string }, existingRequests: { pickupZone: string; destinationZone: string }[]): boolean {
    return existingRequests.every((r) => this.isCompatible(incoming, r));
  }
}
