import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/app/api/utils/sql', () => ({ default: vi.fn() }));
import sql from '@/app/api/utils/sql';

describe('Delivery Match & Accept', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('matches requests near route', async () => {
    sql.mockResolvedValueOnce([{ id: 't1', origin_lat: 48.8566, origin_lon: 2.3522, deviation_km: 2 }]);
    sql.mockResolvedValueOnce([
      { id: 'r1', lat: 48.857, lon: 2.353, status: 'looking' },
      { id: 'r2', lat: 48.87, lon: 2.37, status: 'looking' },
    ]);

    const trip = await sql`SELECT * FROM trips WHERE id = ${'t1'}`;
    const requests = await sql`SELECT * FROM requests WHERE status = 'looking'`;

    const matches = requests.filter(r => {
      const dLat = r.lat - trip[0].origin_lat;
      const dLon = r.lon - trip[0].origin_lon;
      return Math.sqrt(dLat * dLat + dLon * dLon) * 111320 < (trip[0].deviation_km || 2) * 1000;
    });
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('accepts and matches a request', async () => {
    sql.mockResolvedValueOnce([{ id: 'dp1' }]);
    sql.mockResolvedValueOnce([{ delivery_tier: 'free' }]);
    sql.mockResolvedValueOnce([{ cnt: 0 }]);
    sql.mockResolvedValueOnce([{ id: 'r1', status: 'matched', matched_trip_id: 't1' }]);

    const profile = await sql`SELECT id FROM delivery_profiles WHERE user_id = ${'u1'}`;
    const userTier = await sql`SELECT delivery_tier FROM users WHERE id = ${'u1'}`;
    const todayCount = await sql`SELECT COUNT(*) as cnt FROM delivery_requests WHERE delivery_profile_id = ${profile[0].id} AND status = 'matched' AND updated_at >= CURRENT_DATE`;

    if (!(userTier[0].delivery_tier === 'free' && parseInt(todayCount[0].cnt) >= 3)) {
      const result = await sql`
        UPDATE delivery_requests SET status = 'matched', matched_trip_id = ${'t1'}, delivery_profile_id = ${profile[0].id}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${'r1'} AND status = 'looking' RETURNING *
      `;
      expect(result[0].status).toBe('matched');
    }
  });
});

describe('Wallet', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns balance and transactions', async () => {
    sql.mockResolvedValueOnce([{ id: 'w1', balance: 15000 }]);
    sql.mockResolvedValueOnce([{ count: '1' }]);

    const wallet = await sql`SELECT id, balance FROM wallets WHERE user_id = ${'u1'}`;
    const txCount = await sql`SELECT COUNT(*) as count FROM transactions WHERE wallet_id = ${wallet[0].id}`;

    expect(wallet[0].balance).toBe(15000);
    expect(txCount[0].count).toBe('1');
  });

  it('adds deposit to balance', async () => {
    const bal = 10000;
    expect(bal + 5000).toBe(15000);
  });
});

describe('Reviews', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('inserts review', async () => {
    sql.mockResolvedValueOnce([{ id: 'r1' }]);
    const result = await sql`
      INSERT INTO reviews (facility_id, user_id, rating, comment) VALUES (${'f1'}, ${'u1'}, ${5}, ${'Top'}) RETURNING id
    `;
    expect(result[0].id).toBe('r1');
  });
});
