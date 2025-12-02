export const generarHtmlAutorizacion = (nombre, apellido) => {
  // Mapeo de colores según tu paleta para facilitar lectura
  const colors = {
    primary: '#004582',    // CBA_DarkBlue
    link: '#009ada',       // CBA_Blue
    success: '#5CB85C',    // CBA_Green
    textMain: '#29343e',   // CBA_Grey1
    textBody: '#5c6f82',   // CBA_Grey2
    textLight: '#899dac',  // CBA_Grey3
    bg: '#edf0f5',         // CBA_Grey5
    white: '#FFFFFF'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${colors.bg}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.bg}; padding: 40px 20px;">
        <tr>
          <td align="center">
            
            <div style="max-width: 600px; background-color: ${colors.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <div style="background-color: ${colors.primary}; height: 6px; width: 100%;"></div>

              <div style="padding: 40px 30px; text-align: left;">
                
                <h1 style="color: ${colors.textMain}; font-size: 22px; margin-top: 0; margin-bottom: 20px; font-weight: 600;">
                  Estimada/o ${nombre} ${apellido}, buen día.
                </h1>

                <p style="color: ${colors.textBody}; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Le informamos que la nota que cargó en <strong style="color: ${colors.primary};">InscribCórdoba</strong> ha sido <strong style="color: ${colors.success};">autorizada</strong>.
                </p>

                <div style="background-color: ${colors.bg}; border-left: 4px solid ${colors.link}; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                  <p style="margin: 0; color: ${colors.textBody}; font-size: 14px;">
                    Ante cualquier consulta, puede escribir a:<br>
                    <a href="mailto:soportecampuscordoba@cba.gov.ar" style="color: ${colors.link}; text-decoration: none; font-weight: 500;">soportecampuscordoba@cba.gov.ar</a>
                  </p>
                </div>

                <div style="margin-top: 30px; border-top: 1px solid #edf0f5; padding-top: 20px;">
                  <p style="color: ${colors.textMain}; font-size: 16px; margin: 0;">
                    Saludos cordiales,<br>
                    <strong style="color: ${colors.primary}; font-size: 18px;">Equipo Campus Córdoba.</strong>
                  </p>
                </div>

              </div>
              
              <div style="background-color: #f7fbfd; padding: 15px; text-align: center; border-top: 1px solid #edf0f5;">
                 <span style="color: ${colors.textLight}; font-size: 12px;">© Gobierno de la Provincia de Córdoba</span>
              </div>

            </div>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};