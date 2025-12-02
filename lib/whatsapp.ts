import twilio from 'twilio';

// Verificar si Twilio está configurado
const TWILIO_CONFIGURED = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_WHATSAPP_NUMBER
);

// Crear cliente solo si está configurado
let client: any = null;

function getTwilioClient() {
  if (!TWILIO_CONFIGURED) {
    return null;
  }
  
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  
  return client;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
) {
  try {
    const twilioClient = getTwilioClient();
    
    if (!twilioClient) {
      console.log('⚠️  Twilio no configurado - Mensaje simulado:', message);
      return { success: true, simulated: true };
    }

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message
    });

    return { success: true };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { success: false, error };
  }
}

export async function sendApplicationConfirmationWhatsApp(
  candidateName: string,
  candidatePhone: string,
  vacancyTitle: string
) {
  const message = `Hola ${candidateName}! 👋\n\n` +
    `Hemos recibido tu aplicación para el puesto de *${vacancyTitle}*.\n\n` +
    `Nuestro equipo revisará tu CV y te contactaremos pronto. ✅`;

  return await sendWhatsAppMessage(candidatePhone, message);
}

export async function sendInterviewInvitationWhatsApp(
  candidateName: string,
  candidatePhone: string,
  vacancyTitle: string,
  interviewDate: string
) {
  const message = `Hola ${candidateName}! 👋\n\n` +
    `Nos complace invitarte a una entrevista para el puesto de *${vacancyTitle}*.\n\n` +
    `📅 Fecha: ${interviewDate}\n\n` +
    `Por favor confirma tu asistencia. ✅`;

  return await sendWhatsAppMessage(candidatePhone, message);
}

