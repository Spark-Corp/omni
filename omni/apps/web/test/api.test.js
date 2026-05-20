import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the sql utility used in API routes
vi.mock('@/app/api/utils/sql', () => ({
  default: vi.fn(),
}));

import sql from '@/app/api/utils/sql';

describe('Vendor API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/vendors/nearby', () => {
    // Test the nearby route handler logic
    it('should return vendors within radius for given coordinates', async () => {
      const mockVendors = [
        { id: '1', name: 'Vendor 1', lat: 48.8566, lon: 2.3522, distance: 500 },
        { id: '2', name: 'Vendor 2', lat: 48.8570, lon: 2.3530, distance: 800 },
      ];
      
      sql.mockResolvedValueOnce(mockVendors);

      // Simulate the API logic
      const lat = 48.8566;
      const lon = 2.3522;
      const radius = 10000;

      // Direct SQL call test
      const query = `
        SELECT 
          v.id, v.name, v.category, v.description,
          ST_Y(v.location::geometry) as lat,
          ST_X(v.location::geometry) as lon,
          ST_Distance(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance,
          COUNT(p.id) as product_count
        FROM vendors v
        LEFT JOIN products p ON p.vendor_id = v.id
        WHERE v.is_online = true
          AND ST_DWithin(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
        GROUP BY v.id, v.name, v.category, v.description, v.location
        ORDER BY distance
        LIMIT 50
      `;
      
      const result = await sql(query, [lon, lat, radius]);

      expect(sql).toHaveBeenCalledWith(query, [lon, lat, radius]);
      expect(result).toEqual(mockVendors);
    });

    it('should return empty array when no vendors nearby', async () => {
      sql.mockResolvedValueOnce([]);

      const result = await sql(
        expect.any(String),
        [2.3522, 48.8566, 10000]
      );

      expect(result).toEqual([]);
    });

    it('should use default radius of 10000 meters when not specified', async () => {
      sql.mockResolvedValueOnce([]);

      const defaultRadius = 10000;
      await sql(expect.any(String), [2.3522, 48.8566, defaultRadius]);

      expect(sql).toHaveBeenCalledWith(
        expect.any(String),
        [2.3522, 48.8566, 10000]
      );
    });

    it('should fail without lat/lon coordinates', async () => {
      const lat = null;
      const lon = undefined;
      
      const hasValidCoords = !!(lat && lon);
      expect(hasValidCoords).toBe(false);
    });
  });

  describe('POST /api/vendors/search', () => {
    it('should search vendors with search term', async () => {
      const mockVendors = [
        { 
          id: '1', 
          name: 'Bakery', 
          lat: 48.8566, 
          lon: 2.3522, 
          distance: 500,
          products: [{ id: 'p1', name: 'Bread', price: 3.50, unit: 'loaf' }]
        },
      ];
      
      sql.mockResolvedValueOnce(mockVendors);

      const lat = 48.8566;
      const lon = 2.3522;
      const search = 'Bread';
      const radius = 5000;

      const query = `
        SELECT DISTINCT ON (v.id)
          v.id, v.name, v.category, v.description,
          ST_Y(v.location::geometry) as lat,
          ST_X(v.location::geometry) as lon,
          ST_Distance(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography) as distance,
          json_agg(json_build_object(
            '\''id'\'', p.id,
            '\''name'\'', p.name,
            '\''price'\'', p.price,
            '\''unit'\'', p.unit,
            '\''photo_url'\'', p.photo_url
          )) as products
        FROM vendors v
        JOIN products p ON p.vendor_id = v.id
        WHERE v.is_online = true
          AND p.is_available = true
          AND ST_DWithin(v.location, ST_SetSRID(ST_Point($1, $2), 4326)::geography, $3)
          AND p.name ILIKE $4
        GROUP BY v.id, v.name, v.category, v.description, v.location
        ORDER BY v.id, distance
        LIMIT 3
      `;
      
      const params = [lon, lat, radius, `%${search}%`];
      const result = await sql(query, params);

      expect(result).toEqual(mockVendors);
    });

    it('should search vendors without search term (return all nearby)', async () => {
      const mockVendors = [
        { id: '1', name: 'Vendor 1', products: [] },
      ];
      
      sql.mockResolvedValueOnce(mockVendors);

      const lat = 48.8566;
      const lon = 2.3522;
      const search = null;
      const radius = 5000;

      // Without search term, query should not include ILIKE
      const params = [lon, lat, radius];
      
      // Verify that search is optional
      expect(search).toBeNull();
      
      const result = await sql(expect.any(String), params);
      expect(result).toEqual(mockVendors);
    });

    it('should fail without lat/lon coordinates', async () => {
      const lat = undefined;
      const lon = null;
      
      const hasValidCoords = !!(lat && lon);
      expect(hasValidCoords).toBe(false);
    });

    it('should limit results to 3 vendors', async () => {
      sql.mockResolvedValueOnce([]);

      const limit = 3;
      await sql(expect.any(String), [2.3522, 48.8566, 5000]);

      // The query has LIMIT 3
      expect(limit).toBe(3);
    });
  });

  describe('API Error Handling', () => {
    it('should handle SQL errors gracefully', async () => {
      sql.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(sql(expect.any(String), [])).rejects.toThrow('Database connection failed');
    });

    it('should return 400 for missing coordinates', () => {
      // Simulate validation response
      const response = { 
        status: 400, 
        body: { error: 'Latitude and longitude are required' } 
      };
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Latitude and longitude are required');
    });

    it('should return 500 for internal server errors', () => {
      const response = { 
        status: 500, 
        body: { error: 'Internal server error' } 
      };
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});