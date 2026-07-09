import { getAppUrl } from "@/lib/env";

const BRAND = {
  burgundy: "#3B0F14",
  gold: "#C8A86A",
  ivory: "#F7F3EB",
  taupe: "#A79C89",
  charcoal: "#1F1F1F",
  white: "#FFFFFF",
} as const;

/** Playfair Display — matches the Ethnique wordmark logo */
export const FONT_PLAYFAIR =
  "'Playfair Display', Georgia, 'Times New Roman', Times, serif";

export const FONT_SANS = "Arial, Helvetica, sans-serif";

export function getLogoUrl() {
  return `${getAppUrl()}/Logo.png`;
}

export function getTrademarkUrl() {
  return `${getAppUrl()}/Trademark.png`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Styled brand word — always use for the name Ethnique in email copy */
export function brandEthnique(extraStyle = "") {
  const style = [
    `font-family:${FONT_PLAYFAIR}`,
    "font-weight:600",
    "font-style:normal",
    extraStyle,
  ]
    .filter(Boolean)
    .join(";");
  return `<span style="${style}">Ethnique</span>`;
}

/** Apply Playfair styling to every occurrence of "Ethnique" in already-escaped text */
export function styleEthniqueInText(text: string) {
  return text.replace(
    /Ethnique/g,
    `<span style="font-family:${FONT_PLAYFAIR};font-weight:600;font-style:normal;">Ethnique</span>`,
  );
}

type EthniqueEmailOptions = {
  title: string;
  preheader?: string;
  bodyHtml: string;
  signOff?: string;
};

function emailHeaderHtml(logoUrl: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
      <tr>
        <td align="center">
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="margin:0 auto;background-color:${BRAND.ivory};border:1px solid ${BRAND.gold}55;border-radius:12px;"
          >
            <tr>
              <td align="center" style="padding:16px 32px 12px;">
                <img
                  src="${logoUrl}"
                  alt="Ethnique"
                  width="280"
                  height="74"
                  class="email-logo"
                  style="display:block;width:280px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"
                />
              </td>
            </tr>
          </table>
          <p style="margin:12px 0 0;font-family:${FONT_SANS};font-size:10px;font-weight:600;letter-spacing:0.32em;text-transform:uppercase;color:${BRAND.gold};">
            Admin Portal
          </p>
        </td>
      </tr>
    </table>`;
}

function emailSignatureHtml(signOff: string, trademarkUrl: string) {
  return `
          <tr>
            <td style="padding:0 32px 28px;background-color:${BRAND.white};font-family:${FONT_SANS};font-size:14px;line-height:1.5;color:${BRAND.taupe};">
              <p style="margin:0 0 16px;">${signOff}</p>
              <img
                src="${trademarkUrl}"
                alt="Ethnique trademark"
                width="196"
                height="72"
                class="email-trademark"
                style="display:block;width:196px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;"
              />
            </td>
          </tr>`;
}

export function buildEthniqueEmailHtml(options: EthniqueEmailOptions) {
  const logoUrl = getLogoUrl();
  const trademarkUrl = getTrademarkUrl();
  const appUrl = getAppUrl();
  const preheader = options.preheader ?? options.title;
  const signOffRaw = options.signOff ?? "The Ethnique Team";
  const signOff = styleEthniqueInText(escapeHtml(signOffRaw));
  const title = styleEthniqueInText(escapeHtml(options.title));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(options.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&amp;display=swap" rel="stylesheet" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 28px 20px !important; }
      .email-header { padding: 28px 24px !important; }
      .email-logo { width: 220px !important; }
      .email-trademark { width: 168px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.ivory};font-family:${FONT_SANS};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.ivory};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:${BRAND.white};border:1px solid ${BRAND.gold}44;">
          <tr>
            <td class="email-header" align="center" bgcolor="${BRAND.burgundy}" style="padding:32px 32px 28px;background-color:${BRAND.burgundy};">
              ${emailHeaderHtml(logoUrl)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;background-color:${BRAND.white};border-bottom:1px solid ${BRAND.gold}33;">
              <h1 style="margin:0;padding:24px 0 20px;font-family:${FONT_PLAYFAIR};font-size:26px;font-weight:600;line-height:1.3;color:${BRAND.burgundy};">
                ${title}
              </h1>
            </td>
          </tr>
          <tr>
            <td class="email-body" style="padding:28px 32px 32px;background-color:${BRAND.white};font-family:${FONT_SANS};font-size:15px;line-height:1.65;color:${BRAND.charcoal};">
              ${options.bodyHtml}
            </td>
          </tr>
          ${emailSignatureHtml(signOff, trademarkUrl)}
          <tr>
            <td style="padding:20px 32px;background-color:${BRAND.ivory};border-top:1px solid ${BRAND.gold}44;text-align:center;">
              <p style="margin:0 0 8px;font-family:${FONT_SANS};font-size:12px;color:${BRAND.taupe};">
                <a href="${appUrl}" style="color:${BRAND.burgundy};text-decoration:none;font-weight:600;">ethnique.co.uk</a>
              </p>
              <p style="margin:0;font-family:${FONT_SANS};font-size:11px;color:${BRAND.taupe};">
                <a href="mailto:hello@ethnique.co.uk" style="color:${BRAND.taupe};text-decoration:underline;">hello@ethnique.co.uk</a>
              </p>
              <p style="margin:12px 0 0;font-family:${FONT_SANS};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND.gold};">
                Wear · Celebrate · Share
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
      <tr>
        <td align="center" style="border-radius:8px;background-color:${BRAND.burgundy};">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT_SANS};font-size:14px;font-weight:600;letter-spacing:0.04em;color:${BRAND.ivory};text-decoration:none;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

export function emailMutedNote(html: string) {
  return `<p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:${BRAND.taupe};">${html}</p>`;
}

export function emailInfoBox(html: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
      <tr>
        <td style="padding:16px 18px;background-color:${BRAND.ivory};border-left:3px solid ${BRAND.gold};border-radius:0 8px 8px 0;font-family:${FONT_SANS};font-size:14px;line-height:1.55;color:${BRAND.charcoal};">
          ${html}
        </td>
      </tr>
    </table>`;
}
