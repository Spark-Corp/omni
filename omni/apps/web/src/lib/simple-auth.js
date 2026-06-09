import { neon } from '@neondatabase/serverless';
import axios from 'axios';

// Configuration Neon
const sql = neon(process.env.DATABASE_URL);

// Africa's Talking SMS Service
class AfricaTalkingSMS {
  constructor() {
    this.username = process.env.AT_USERNAME || 'sandbox';
    this.apiKey = process.env.AT_API_KEY || 'atsandbox-key';
    this.baseUrl = 'https://api.africastalking.com/version1/messaging';
  }

  async sendSMS(phone, message) {
    try {
      // Pour le sandbox, on simule l'envoi
      if (this.username === 'sandbox') {
        console.log(`[SMS MOCK] To: ${phone}, Message: ${message}`);
        return { success: true, messageId: 'mock-' + Date.now() };
      }

      const response = await axios.post(
        this.baseUrl,
        {
          username: this.username,
          to: phone,
          message: message,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'apiKey': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('SMS Error:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

const smsService = new AfricaTalkingSMS();

// API pour envoyer OTP
export async function sendOTP(phone) {
  try {
    // Générer OTP (mock: 123456)
    const otp = '123456';
    
    const message = `Votre code de vérification OMNI est: ${otp}. Valide 5 minutes.`;
    
    await smsService.sendSMS(phone, message);
    
    return { success: true, message: 'OTP envoyé avec succès' };
  } catch (error) {
    console.error('Send OTP error:', error);
    return { success: false, error: 'Échec envoi OTP' };
  }
}

// API pour vérifier OTP
export async function verifyOTP(phone, otp) {
  try {
    if (otp !== '123456') {
      return { success: false, error: 'Code OTP invalide' };
    }

    // Chercher l'utilisateur avec SQL direct
    const users = await sql`
      SELECT * FROM users WHERE phone = ${phone} LIMIT 1
    `;

    let user;
    if (users.length === 0) {
      // Créer un nouvel utilisateur
      const newUsers = await sql`
        INSERT INTO users (name, email, phone, preferred_language) 
        VALUES (${`User ${phone.slice(-4)}`}, ${`${phone}@user.omni`}, ${phone}, 'fr')
        RETURNING *
      `;
      user = newUsers[0];
    } else {
      user = users[0];
    }

    return { 
      success: true, 
      user: user,
      message: 'Connexion réussie' 
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, error: 'Erreur vérification OTP' };
  }
}
