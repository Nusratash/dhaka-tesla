import { HttpException, HttpStatus } from '@nestjs/common';

// Domain-specific exceptions extending HttpException, so every error in the
// app carries a consistent { statusCode, message, error } shape while still
// being distinguishable/catchable by type where callers need to branch on it.

export class SeatCapacityExceededException extends HttpException {
  constructor(teslaId: string) {
    super(
      { message: `Tesla ${teslaId} has no available seats for this request`, error: 'SEAT_CAPACITY_EXCEEDED' },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidStateTransitionException extends HttpException {
  constructor(from: string, to: string) {
    super(
      { message: `Cannot transition ride from ${from} to ${to}`, error: 'INVALID_STATE_TRANSITION' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class UnauthorizedRideAccessException extends HttpException {
  constructor() {
    super(
      { message: 'You do not have access to this ride', error: 'UNAUTHORIZED_RIDE_ACCESS' },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class CancellationNotAllowedException extends HttpException {
  constructor(status: string) {
    super(
      { message: `Ride cannot be cancelled once it is ${status}`, error: 'CANCELLATION_NOT_ALLOWED' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class IncompatibleRouteException extends HttpException {
  constructor() {
    super(
      { message: 'This request is not compatible with the target pool\'s route', error: 'INCOMPATIBLE_ROUTE' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
