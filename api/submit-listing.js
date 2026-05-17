import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || '';

    let fields = {};
    let attachments = [];

    if (contentType.includes('multipart/form-data')) {
      const boundary = contentType.split('boundary=')[1];
      if (boundary) {
        const parsed = parseMultipart(rawBody, boundary);
        fields = parsed.fields;
        attachments = parsed.files;
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawBody.toString());
      for (const [key, value] of params.entries()) {
        fields[key] = value;
      }
    } else if (contentType.includes('application/json')) {
      const json = JSON.parse(rawBody.toString());
      fields = json;
    }

    const emailBody = buildEmailBody(fields, attachments);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"ATEMS Lift Exchange" <' + process.env.GMAIL_USER + '>',
      to: 'atemsliftexchange@gmail.com',
      subject: ('New Equipment Listing: ' + (fields.mfg || 'Unknown') + ' ' + (fields.model || '') + ' ' + (fields.year || '')).trim(),
      html: emailBody,
      attachments: attachments.map((file) => ({
        filename: file.filename,
        content: file.data,
        contentType: file.contentType,
      })),
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ ok: true, message: 'Listing submitted successfully!' });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
}

function buildEmailBody(fields, attachments) {
  const row = (label, value) =>
    value
      ? '<tr><td style="padding:6px 12px;font-weight:600;color:#1C3A6E;background:#f5f7fa;border:1px solid #dde3f0;white-space:nowrap;width:200px">' + label + '</td><td style="padding:6px 12px;border:1px solid #dde3f0">' + value + '</td></tr>'
      : '';

  const photoCount = attachments.filter(f => f.fieldname === 'photos' || f.contentType.startsWith('image/')).length;
  const videoCount = attachments.filter(f => f.fieldname === 'video' || f.contentType.startsWith('video/')).length;

  return '<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto"><div style="background:#122650;padding:20px 24px;border-bottom:4px solid #C8901A"><h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px">ATEMS LIFT EXCHANGE</h1><p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">New Equipment Listing Submission</p></div><div style="padding:24px"><h2 style="color:#1C3A6E;border-bottom:2px solid #C8901A;padding-bottom:8px;font-size:16px;margin-top:0">Equipment Details</h2><table style="width:100%;border-collapse:collapse;margin-bottom:20px">' + row('Manufacturer', fields.mfg) + row('Year', fields.year) + row('Model', fields.model) + row('Serial Number', fields.serial_number) + row('Hours', fields.hours) + '</table><h2 style="color:#1C3A6E;border-bottom:2px solid #C8901A;padding-bottom:8px;font-size:16px">Owner / Contact Information</h2><table style="width:100%;border-collapse:collapse;margin-bottom:20px">' + row('Contact Name', fields.contact_name) + row('Company', fields.company) + row('Phone', fields.phone) + row('Email', fields.email) + '</table><h2 style="color:#1C3A6E;border-bottom:2px solid #C8901A;padding-bottom:8px;font-size:16px">Condition & Documentation</h2><table style="width:100%;border-collapse:collapse;margin-bottom:20px">' + row('ATEMS Verified', fields.atems_verified) + row('History Search Done', fields.history_search) + row('Last Inspection Date', fields.last_inspection_date) + row('Inspection Report Available', fields.inspection_copy) + row('ATEMS Assessment Requested', fields.atems_assess) + '</table>' + (fields.known_issues ? '<h2 style="color:#1C3A6E;border-bottom:2px solid #C8901A;padding-bottom:8px;font-size:16px">Known Issues</h2><p style="background:#fff8f0;border-left:4px solid #C8901A;padding:12px;margin-bottom:20px;border-radius:4px">' + fields.known_issues + '</p>' : '') + (fields.video_url ? '<h2 style="color:#1C3A6E;border-bottom:2px solid #C8901A;padding-bottom:8px;font-size:16px">Video Link</h2><p style="margin-bottom:20px"><a href="' + fields.video_url + '" style="color:#1C3A6E">' + fields.video_url + '</a></p>' : '') + '<h2 style="color:#1C3A6E;border-bottom:2px solid #C8901A;padding-bottom:8px;font-size:16px">Attachments</h2><table style="width:100%;border-collapse:collapse;margin-bottom:20px">' + row('Photos attached', photoCount > 0 ? photoCount + ' photo(s) - see email attachments' : 'None') + row('Video attached', videoCount > 0 ? videoCount + ' video file(s) - see email attachments' : 'None') + '</table><p style="color:#888;font-size:12px;border-top:1px solid #eee;padding-top:12px;margin-top:20px">Submitted via the ATEMS Lift Exchange equipment listing form at <a href="https://www.atemsliftexchange.com" style="color:#1C3A6E">atemsliftexchange.com</a></p></div></div>';
}

function parseMultipart(buffer, boundary) {
  const fields = {};
  const files = [];
  const boundaryBuffer = Buffer.from('--' + boundary);
  const parts = splitBuffer(buffer, boundaryBuffer);
  for (const part of parts) {
    if (part.length < 4) continue;
    const crlfcrlf = findSequence(part, Buffer.from('\r\n\r\n'));
    if (crlfcrlf === -1) continue;
    const headerBuf = part.slice(0, crlfcrlf);
    const bodyBuf = part.slice(crlfcrlf + 4);
    const body = bodyBuf.length >= 2 ? bodyBuf.slice(0, bodyBuf.length - 2) : bodyBuf;
    const headers = headerBuf.toString();
    const dispMatch = headers.match(/Content-Disposition:[^\r\n]*name="([^"]+)"/i);
    const fileMatch = headers.match(/Content-Disposition:[^\r\n]*filename="([^"]+)"/i);
    const ctMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
    if (!dispMatch) continue;
    const fieldName = dispMatch[1];
    if (fileMatch) {
      const filename = fileMatch[1];
      const contentType = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';
      if (filename && body.length > 0) files.push({ fieldname: fieldName, filename, contentType, data: body });
    } else {
      fields[fieldName] = fields[fieldName] !== undefined ? fields[fieldName] + '\n' + body.toString('utf8') : body.toString('utf8');
    }
  }
  return { fields, files };
}

function splitBuffer(buf, delimiter) {
  const parts = [];
  let start = 0;
  let pos = findSequence(buf, delimiter, start);
  while (pos !== -1) {
    if (pos > start) parts.push(buf.slice(start, pos));
    start = pos + delimiter.length;
    if (buf[start] === 13 && buf[start + 1] === 10) start += 2;
    pos = findSequence(buf, delimiter, start);
  }
  if (start < buf.length) parts.push(buf.slice(start));
  return parts;
}

function findSequence(buf, seq, offset = 0) {
  outer: for (let i = offset; i <= buf.length - seq.length; i++) {
    for (let j = 0; j < seq.length; j++) {
      if (buf[i + j] !== seq[j]) continue outer;
    }
    return i;
  }
  return -1;
}
