import nodemailer from 'nodemailer';

// Crea trasporter per inviare email
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendBookingConfirmationParams {
  to: string;
  businessName: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  businessPhone?: string;
  cancellationPolicy?: string;
}

export async function sendBookingConfirmation(params: SendBookingConfirmationParams) {
  const {
    to,
    businessName,
    clientName,
    serviceName,
    staffName,
    date,
    time,
    duration,
    price,
    businessPhone,
    cancellationPolicy,
  } = params;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .detail-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { color: #6b7280; font-size: 14px; }
          .value { font-weight: bold; color: #111827; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✓ Prenotazione Confermata</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Grazie per aver prenotato con ${businessName}</p>
          </div>
          
          <div class="content">
            <p>Ciao <strong>${clientName}</strong>,</p>
            <p>La tua prenotazione è stata confermata con successo!</p>
            
            <div class="detail-box">
              <h3 style="margin-top: 0; color: #0ea5e9;">Dettagli Prenotazione</h3>
              <div class="detail-row">
                <span class="label">Servizio:</span>
                <span class="value">${serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Operatore:</span>
                <span class="value">${staffName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Data:</span>
                <span class="value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="label">Ora:</span>
                <span class="value">${time}</span>
              </div>
              <div class="detail-row">
                <span class="label">Durata:</span>
                <span class="value">${duration} minuti</span>
              </div>
              <div class="detail-row">
                <span class="label">Prezzo:</span>
                <span class="value">€${price.toFixed(2)}</span>
              </div>
            </div>

            ${cancellationPolicy ? `
              <div class="warning">
                <strong>⚠️ Politica di Cancellazione</strong><br/>
                ${cancellationPolicy}
              </div>
            ` : ''}

            ${businessPhone ? `
              <p>Per qualsiasi modifica o cancellazione, contattaci al <strong>${businessPhone}</strong></p>
            ` : ''}
            
            <p style="margin-top: 30px;">Ci vediamo presto!</p>
            <p><strong>${businessName}</strong></p>
          </div>
          
          <div class="footer">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Questo è un messaggio automatico da PrenotaFacile<br/>
              Non rispondere a questa email
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"${businessName}" <${process.env.EMAIL_FROM || 'noreply@prenotafacile.com'}>`,
    to,
    subject: `✓ Prenotazione Confermata - ${businessName}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
