import { randomUUID } from 'node:crypto';

export interface Customer {
  name: string;
  email: string;
  subscribeToPromotions: boolean;
}

/**
 * Builds a valid customer. Emails are unique per call so parallel workers
 * never collide, and tests can override only what they care about:
 *   buildCustomer({ name: '' })   // the "missing name" scenario
 */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  const id = randomUUID().slice(0, 8);
  return {
    name: `QA Tester ${id}`,
    email: `qa.${id}@example.com`,
    subscribeToPromotions: false,
    ...overrides,
  };
}
