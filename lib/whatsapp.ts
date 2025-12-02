import twilio from 'twilio';

// Verificar si Twilio está configurado
const TWILIO_CONFIGURED = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_WHATSAPP_NUMBER
);

// Log de configuración al cargar el módulo
if (TWILIO_CONFIGURED) {
  console.log('✅ Twilio configurado correctamente');
  console.log('   Account SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...');
  console.log('   WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
} else {
  console.log('⚠️  Twilio NO configurado - Variables faltantes:');
  console.log('   TWILIO_ACCOUNT_SID:', !!process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌');
  console.log('   TWILIO_AUTH_TOKEN:', !!process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌');
  console.log('   TWILIO_WHATSAPP_NUMBER:', !!process.env.TWILIO_WHATSAPP_NUMBER ? '✅' : '❌');
}

// Función para limpiar y formatear número de teléfono
function formatPhoneNumber(phone: string): string {
  // Eliminar todos los espacios, guiones, paréntesis, puntos, etc.
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Verificar si ya tiene el formato +549 (correcto para Argentina)
  if (cleaned.startsWith('+549') || cleaned.startsWith('549')) {
    // Ya tiene el formato correcto, solo asegurar el +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
  }
  // Si tiene +54 o 54 pero falta el 9 (prefijo móvil argentino)
  else if (cleaned.startsWith('+54')) {
    // +54... → +549...
    cleaned = '+549' + cleaned.substring(3);
  }
  else if (cleaned.startsWith('54')) {
    // 54... → +549...
    cleaned = '+549' + cleaned.substring(2);
  }
  // Si no tiene código de país, agregar +549 (Argentina con prefijo móvil)
  else {
    // Asumir Argentina y agregar +549
    cleaned = '+549' + cleaned;
  }
  
  console.log('📞 Número original:', phone);
  console.log('📞 Número formateado:', cleaned);
  
  return cleaned;
}

// Crear cliente solo si está configurado
let client: any = null;

function getTwilioClient() {
  if (!TWILIO_CONFIGURED) {
    console.log('⚠️  getTwilioClient: Twilio no configurado');
    return null;
  }
  
  if (!client) {
    console.log('📱 Creando cliente de Twilio...');
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Cliente de Twilio creado');
  }
  
  return client;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
) {
  console.log('\n📱 ===== INTENTANDO ENVIAR WHATSAPP =====');
  console.log('📞 Número destino (original):', to);
  
  // Limpiar y formatear el número
  const formattedPhone = formatPhoneNumber(to);
  
  console.log('📝 Mensaje:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
  
  try {
    const twilioClient = getTwilioClient();
    
    if (!twilioClient) {
      console.log('⚠️  Twilio no configurado - Mensaje simulado');
      console.log('📱 ===== FIN ENVÍO WHATSAPP (SIMULADO) =====\n');
      return { success: true, simulated: true };
    }

    console.log('📤 Enviando mensaje a Twilio...');
    console.log('   From:', process.env.TWILIO_WHATSAPP_NUMBER);
    console.log('   To:', `whatsapp:${formattedPhone}`);
    
    const result = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedPhone}`,
      body: message
    });

    console.log('✅ Mensaje enviado exitosamente!');
    console.log('   Message SID:', result.sid);
    console.log('   Status:', result.status);
    console.log('📱 ===== FIN ENVÍO WHATSAPP (EXITOSO) =====\n');
    
    return { success: true, sid: result.sid, status: result.status };
  } catch (error: any) {
    console.error('❌ Error enviando WhatsApp:');
    console.error('   Tipo:', error.constructor.name);
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('   Status:', error.status);
    if (error.moreInfo) {
      console.error('   Más info:', error.moreInfo);
    }
    console.log('📱 ===== FIN ENVÍO WHATSAPP (ERROR) =====\n');
    return { success: false, error: error.message, code: error.code, status: error.status };
  }
}

export async function sendApplicationConfirmationWhatsApp(
  candidateName: string,
  candidatePhone: string,
  vacancyTitle: string
) {
  console.log('\n🎯 ===== ENVIANDO CONFIRMACIÓN DE POSTULACIÓN =====');
  console.log('👤 Candidato:', candidateName);
  console.log('📞 Teléfono:', candidatePhone);
  console.log('💼 Vacante:', vacancyTitle);
  
  const message = `Hola ${candidateName}! 👋\n\n` +
    `Hemos recibido tu aplicación para el puesto de *${vacancyTitle}*.\n\n` +
    `Nuestro equipo revisará tu CV y te contactaremos pronto. ✅`;

  const result = await sendWhatsAppMessage(candidatePhone, message);
  
  console.log('📊 Resultado:', result);
  console.log('🎯 ===== FIN CONFIRMACIÓN DE POSTULACIÓN =====\n');
  
  return result;
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

