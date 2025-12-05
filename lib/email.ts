import nodemailer from 'nodemailer';

// Verificar si el email está configurado
const EMAIL_CONFIGURED = !!(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

// Crear transporter solo si está configurado
let transporter: any = null;

function getTransporter() {
  if (!EMAIL_CONFIGURED) {
    return null;
  }
  
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const emailTransporter = getTransporter();
  
  if (!emailTransporter) {
    console.log('⚠️  Email no configurado - Se requieren variables EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
    return { success: false, error: 'Email not configured' };
  }

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
}

export async function sendApplicationConfirmation(
  candidateName: string,
  candidateEmail: string,
  vacancyTitle: string
) {
  const html = `
    <h1>¡Gracias por tu postulación!</h1>
    <p>Hola ${candidateName},</p>
    <p>Hemos recibido tu aplicación para el puesto de <strong>${vacancyTitle}</strong>.</p>
    <p>Nuestro equipo revisará tu CV y nos pondremos en contacto contigo pronto.</p>
    <br>
    <p>Saludos cordiales,<br>Equipo de Recursos Humanos</p>
  `;

  return await sendEmail(
    candidateEmail,
    `Confirmación de postulación - ${vacancyTitle}`,
    html
  );
}

export async function sendInterviewInvitation(
  candidateName: string,
  candidateEmail: string,
  vacancyTitle: string,
  interviewDate: string,
  interviewLink?: string
) {
  const html = `
    <h1>Invitación a Entrevista</h1>
    <p>Hola ${candidateName},</p>
    <p>Nos complace invitarte a una entrevista para el puesto de <strong>${vacancyTitle}</strong>.</p>
    <p><strong>Fecha y hora:</strong> ${interviewDate}</p>
    ${interviewLink ? `<p><strong>Link:</strong> <a href="${interviewLink}">${interviewLink}</a></p>` : ''}
    <p>Por favor confirma tu asistencia respondiendo a este correo.</p>
    <br>
    <p>Saludos cordiales,<br>Equipo de Recursos Humanos</p>
  `;

  return await sendEmail(
    candidateEmail,
    `Invitación a Entrevista - ${vacancyTitle}`,
    html
  );
}

export async function sendOfferLetter(
  candidateName: string,
  candidateEmail: string,
  vacancyTitle: string,
  offerLetterContent: string
) {
  const html = `
    <h1>Carta de Oferta</h1>
    <p>Hola ${candidateName},</p>
    <p>Nos complace extenderte una oferta para el puesto de <strong>${vacancyTitle}</strong>.</p>
    <hr>
    ${offerLetterContent.replace(/\n/g, '<br>')}
    <hr>
    <p>Por favor revisa los detalles y confirma tu aceptación respondiendo a este correo.</p>
    <br>
    <p>Saludos cordiales,<br>Equipo de Recursos Humanos</p>
  `;

  return await sendEmail(
    candidateEmail,
    `Oferta de Trabajo - ${vacancyTitle}`,
    html
  );
}

export async function sendEvaluationNotification(
  candidateName: string,
  candidateEmail: string,
  vacancyTitle: string
) {
  const html = `
    <h1>Actualización de tu Proceso</h1>
    <p>Hola ${candidateName},</p>
    <p>Te informamos que tu aplicación para el puesto de <strong>${vacancyTitle}</strong> está en etapa de evaluación.</p>
    <p>Nuestro equipo está revisando tu perfil y experiencia. Te contactaremos con los próximos pasos en breve.</p>
    <br>
    <p>Saludos cordiales,<br>Equipo de Recursos Humanos</p>
  `;

  return await sendEmail(
    candidateEmail,
    `Actualización - ${vacancyTitle}`,
    html
  );
}

export async function sendRejectionNotification(
  candidateName: string,
  candidateEmail: string,
  vacancyTitle: string
) {
  const html = `
    <h1>Actualización de tu Proceso</h1>
    <p>Hola ${candidateName},</p>
    <p>Gracias por tu interés en el puesto de <strong>${vacancyTitle}</strong>.</p>
    <p>Después de una cuidadosa revisión, lamentamos informarte que en esta ocasión no podremos avanzar con tu candidatura.</p>
    <p>Valoramos mucho el tiempo que invertiste en el proceso y te deseamos éxito en tu búsqueda profesional.</p>
    <br>
    <p>Saludos cordiales,<br>Equipo de Recursos Humanos</p>
  `;

  return await sendEmail(
    candidateEmail,
    `Actualización - ${vacancyTitle}`,
    html
  );
}

