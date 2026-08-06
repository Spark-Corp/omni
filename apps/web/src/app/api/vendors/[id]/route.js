import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const vendorQuery = `
      SELECT 
        v.id,
        v.name,
        v.category,
        v.description,
        v.email,
        v.phone,
        ST_Y(v.location::geometry) as lat,
        ST_X(v.location::geometry) as lon,
        v.is_online,
        v.rating
      FROM vendors v
      WHERE v.id = $1
    `;

    const facilitiesQuery = `
      SELECT 
        f.id,
        f.name as facility_name,
        f.category,
        f.type,
        f.description,
        f.is_online,
        f.rating,
        ST_Y(f.location::geometry) as lat,
        ST_X(f.location::geometry) as lon,
        f.address,
        f.neighborhood,
        COUNT(p.id) as product_count
      FROM facilities f
      LEFT JOIN products p ON p.facility_id = f.id
      WHERE f.vendor_id = $1
      GROUP BY f.id, f.name, f.category, f.type, f.description, f.is_online, f.rating, f.location, f.address, f.neighborhood
      ORDER BY f.created_at ASC
    `;

    const productQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.currency,
        p.unit,
        p.image_url,
        p.facility_id
      FROM products p
      WHERE p.vendor_id = $1
      ORDER BY p.name
    `;

    const [vendors, facilities, products] = await Promise.all([
      sql(vendorQuery, [id]),
      sql(facilitiesQuery, [id]),
      sql(productQuery, [id]),
    ]);

    if (vendors.length === 0) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vendor = {
      ...vendors[0],
      facilities,
      products,
    };

    return Response.json({ vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return Response.json(
      { error: "Failed to fetch vendor details" },
      { status: 500 },
    );
  }
}
