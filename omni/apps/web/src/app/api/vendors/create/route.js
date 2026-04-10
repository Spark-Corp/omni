import sql from "@/app/api/utils/sql";
import { authClient } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await authClient.getSession();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, description, lat, lon, products } = body;

    if (!name || !category || !lat || !lon) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const authUserId = session.user.id;

    // Update auth_users role to seller
    await sql`UPDATE auth_users SET role = 'seller' WHERE id = ${authUserId}`;

    // Get or create user in users table
    let userResult = await sql`
      SELECT id FROM users WHERE id = ${authUserId}::uuid
    `;

    if (userResult.length === 0) {
      // Create user in users table (matching auth_users id as UUID)
      userResult = await sql`
        INSERT INTO users (id, phone, role, lang_preference)
        VALUES (
          ${authUserId}::uuid,
          '',
          'seller',
          'fr'
        )
        RETURNING id
      `;
    }

    const userId = userResult[0].id;

    // Create vendor
    const vendorResult = await sql`
      INSERT INTO vendors (user_id, name, category, description, location, is_online)
      VALUES (
        ${userId},
        ${name},
        ${category},
        ${description || null},
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
        true
      )
      RETURNING id, name, category, description, is_online, created_at
    `;

    const vendor = vendorResult[0];

    // Create products if provided
    if (products && products.length > 0) {
      for (const product of products) {
        if (product.name && product.price) {
          await sql`
            INSERT INTO products (vendor_id, name, category, price, unit, is_available)
            VALUES (
              ${vendor.id},
              ${product.name},
              ${product.category || "Général"},
              ${parseFloat(product.price)},
              ${product.unit || "unité"},
              true
            )
          `;
        }
      }
    }

    return Response.json({ vendor, success: true });
  } catch (err) {
    console.error("POST /api/vendors/create error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
