import { sendOTP } from '@/lib/simple-auth';

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return Response.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    const result = await sendOTP(phone);

    return Response.json(result);
  } catch (error) {
    console.error('Send OTP API error:', error);
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
