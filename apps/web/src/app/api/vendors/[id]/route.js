import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get vendor details with all their products
    const vendorQuery = `
      SELECT 
        v.id,
        v.name,
        v.category,
        v.description,
        ST_Y(v.location::geometry) as lat,
        ST_X(v.location::geometry) as lon,
        v.is_online
      FROM vendors v
      WHERE v.id = $1
    `;

    const productQuery = `
      SELECT 
        id,
        name,
        description,
        price,
        currency,
        unit,
        image_url
      FROM products
      WHERE vendor_id = $1
      ORDER BY name
    `;

    const [vendors, products] = await Promise.all([
      sql(vendorQuery, [id]),
      sql(productQuery, [id]),
    ]);

    if (vendors.length === 0) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vendor = {
      ...vendors[0],
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
