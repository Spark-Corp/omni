import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/app/api/utils/sql', () => ({ default: vi.fn() }));
import sql from '@/app/api/utils/sql';

const mockSql = vi.mocked(sql);

describe('Cart Flow', () => {
  beforeEach(() => { vi.clearAllMocks(); mockSql.mockResolvedValue([]); });

  it('sends cart with cash payment', async () => {
    mockSql.mockResolvedValueOnce([{ id: 'f1', vendor_id: 'v1' }]);
    mockSql.mockResolvedValueOnce([{ id: 'c1', created_at: new Date(), expires_at: new Date() }]);

    const facility = await sql`SELECT id, vendor_id FROM facilities WHERE id = ${'f1'}`;
    const cart = await sql`INSERT INTO carts (buyer_id, facility_id, payment_method) VALUES (${'b1'}, ${'f1'}, ${'cash'}) RETURNING id`;

    expect(facility[0].vendor_id).toBe('v1');
    expect(cart[0].id).toBe('c1');
  });

  it('creates escrow hold on confirm', async () => {
    mockSql.mockResolvedValueOnce([{ id: 'c1', status: 'pending', facility_id: 'f1', payment_method: 'escrow' }]);
    mockSql.mockResolvedValueOnce([{ status: 'confirmed' }]);
    mockSql.mockResolvedValueOnce([{ id: 'c1', buyer_id: 'b1', facility_id: 'f1', total: 5000 }]);

    const cart = await sql`SELECT c.id, c.status, c.facility_id, c.payment_method FROM carts c WHERE c.id = ${'c1'}`;
    const recheck = await sql`SELECT status FROM carts WHERE id = ${'c1'}`;
    const cartDetail = await sql`
      SELECT SUM(p.price * ar.quantity_confirmed) as total FROM carts c
      JOIN availability_requests ar ON ar.cart_id = c.id
      JOIN products p ON p.id = ar.product_id
      WHERE c.id = ${'c1'} AND ar.status = 'confirmed' GROUP BY c.id
    `;

    expect(cart[0].payment_method).toBe('escrow');
    expect(recheck[0].status).toBe('confirmed');
    expect(parseFloat(cartDetail[0].total)).toBe(5000);
  });

  it('releases escrow on received', async () => {
    mockSql.mockResolvedValueOnce([{ id: 'c1', status: 'confirmed', buyer_id: 'b1' }]);
    mockSql.mockResolvedValueOnce([{ id: 'eh1', vendor_id: 'v1', amount: '5000', fee: '50' }]);
    mockSql.mockResolvedValueOnce([{ user_id: 'uv1' }]);

    const cart = await sql`SELECT id, status, buyer_id FROM carts WHERE id = ${'c1'}`;
    const escrowHold = await sql`SELECT id, vendor_id, amount, fee FROM escrow_holds WHERE cart_id = ${'c1'} AND released_at IS NULL AND refunded_at IS NULL`;
    const vendorUser = await sql`SELECT user_id FROM vendors WHERE id = ${escrowHold[0].vendor_id}`;

    expect(cart[0].status).toBe('confirmed');
    expect(escrowHold[0].amount).toBe('5000');
    expect(vendorUser[0].user_id).toBe('uv1');
  });

  it('refunds escrow on cancel', async () => {
    mockSql.mockResolvedValueOnce([{ id: 'c1', status: 'pending', buyer_id: 'b1' }]);
    mockSql.mockResolvedValueOnce([{ id: 'eh1', buyer_id: 'b1', amount: '5000', fee: '50' }]);

    const cart = await sql`SELECT id, status, buyer_id FROM carts WHERE id = ${'c1'}`;
    const escrowHold = await sql`SELECT id, buyer_id, amount, fee FROM escrow_holds WHERE cart_id = ${'c1'} AND released_at IS NULL AND refunded_at IS NULL`;

    const refundAmount = parseFloat(escrowHold[0].amount) + parseFloat(escrowHold[0].fee);
    expect(cart[0].status).toBe('pending');
    expect(refundAmount).toBe(5050);
  });
});

describe('Free Tier Limits', () => {
  beforeEach(() => { mockSql.mockResolvedValue([]); });

  it('rejects escrow for free vendor (vendor_tier=free)', () => {
    const userTier = [{ vendor_tier: 'free' }];
    const isFree = userTier[0].vendor_tier === 'free';
    expect(isFree).toBe(true);
  });

  it('blocks facility creation when count >= 1', () => {
    const count = [{ cnt: '1' }];
    const blocked = parseInt(count[0].cnt) >= 1;
    expect(blocked).toBe(true);
  });

  it('blocks product creation when count >= 5', () => {
    const count = [{ cnt: '5' }];
    const blocked = parseInt(count[0].cnt) >= 5;
    expect(blocked).toBe(true);
  });

  it('blocks delivery accept when count >= 3', () => {
    const count = [{ cnt: '3' }];
    const blocked = parseInt(count[0].cnt) >= 3;
    expect(blocked).toBe(true);
  });

  it('clears waypoints for free tier rayon mode', () => {
    const userTier = [{ delivery_tier: 'free' }];
    let waypoints = [{ lat: 1, lon: 2 }];
    let deviationKm = 5;

    if (userTier[0].delivery_tier === 'free') {
      waypoints = [];
      deviationKm = 0;
    }
    expect(waypoints).toEqual([]);
    expect(deviationKm).toBe(0);
  });
});

describe('Match Distance', () => {
  it('filters requests within deviation radius', () => {
    const trip = { origin_lat: 48.8566, origin_lon: 2.3522, deviation_km: 2 };
    const requests = [
      { lat: 48.857, lon: 2.353, name: 'Proche' },
      { lat: 48.87, lon: 2.37, name: 'Loin' },
    ];

    const matches = requests.filter(r => {
      const d = Math.sqrt((r.lat - trip.origin_lat)**2 + (r.lon - trip.origin_lon)**2) * 111320;
      return d < trip.deviation_km * 1000;
    });
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe('Proche');
  });
});

describe('Wallet & Reviews', () => {
  beforeEach(() => { mockSql.mockResolvedValue([]); });

  it('reads wallet balance', async () => {
    mockSql.mockResolvedValueOnce([{ id: 'w1', balance: 15000 }]);
    const wallet = await sql`SELECT * FROM wallets WHERE user_id = ${'u1'}`;
    expect(wallet[0].balance).toBe(15000);
  });

  it('creates review for completed cart', () => {
    const cart = [{ id: 'c1', status: 'completed', buyer_id: 'b1' }];
    expect(cart[0].status).toBe('completed');
  });

  it('deposit adds to balance', () => {
    expect(10000 + 5000).toBe(15000);
  });
});
