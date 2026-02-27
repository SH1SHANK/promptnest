(() => {
/**
 * File: utils/exporter.js
 * Purpose: Converts chat data into markdown, text, and PDF export files with optional presentation preferences.
 * Communicates with: popup/popup.js, content/toolbar.js, content/content.js.
 */

const DEFAULT_PREFS = {
  fontStyle: 'System',
  fontSize: 14,
  background: 'dark',
  customBackground: '#18181c',
  contentMode: 'structured',
  includeTimestamps: false,
  includeExportDate: true,
  includePlatformLabel: true,
  includeMessageNumbers: false,
  headerText: ''
};

/** Returns a safe merged preferences object with normalized values. */
const normalizePrefs = (prefs = {}) => {
  const merged = { ...DEFAULT_PREFS, ...(prefs || {}) };
  const numericFontSize = Number(merged.fontSize);
  return {
    fontStyle: String(merged.fontStyle || DEFAULT_PREFS.fontStyle),
    fontSize: Number.isFinite(numericFontSize) ? Math.min(20, Math.max(12, numericFontSize)) : DEFAULT_PREFS.fontSize,
    background: String(merged.background || DEFAULT_PREFS.background).toLowerCase(),
    customBackground: String(merged.customBackground || DEFAULT_PREFS.customBackground),
    contentMode: String(merged.contentMode || DEFAULT_PREFS.contentMode).toLowerCase(),
    includeTimestamps: Boolean(merged.includeTimestamps),
    includeExportDate: Boolean(merged.includeExportDate),
    includePlatformLabel: Boolean(merged.includePlatformLabel),
    includeMessageNumbers: Boolean(merged.includeMessageNumbers),
    headerText: String(merged.headerText || '').trim()
  };
};

/** Builds a safe export chat object from unknown input. */
const normalizeChat = (chat) => {
  const value = chat && typeof chat === 'object' ? chat : {};
  return {
    title: String(value.title || 'Promptium Chat').trim(),
    platform: String(value.platform || 'unknown').trim(),
    createdAt: String(value.createdAt || new Date().toISOString()),
    messages: Array.isArray(value.messages) ? value.messages : []
  };
};

/** Returns a human-readable role label for exported message rows. */
const formatRole = (role) => {
  const safeRole = String(role || 'unknown').trim().toLowerCase();
  return safeRole.charAt(0).toUpperCase() + safeRole.slice(1);
};

/** Returns a timestamp prefix when enabled by preferences. */
const buildTimestampPrefix = (message, prefs) => {
  if (!prefs.includeTimestamps) {
    return '';
  }

  const base = message?.timestamp || message?.createdAt || new Date().toISOString();
  const stamp = new Date(base);

  if (Number.isNaN(stamp.getTime())) {
    return '';
  }

  return `[${stamp.toLocaleTimeString()}] `;
};

/** Returns plain message text rows in original order. */
const getMessageTextRows = (chat) => (chat.messages || []).map((message) => String(message?.text || '').trim()).filter(Boolean);

/** Returns one merged text block for combined export mode. */
const getCombinedText = (chat) => getMessageTextRows(chat).join('\n\n').trim();

/** Maps user-facing font selection to an available jsPDF font family. */
const resolvePdfFont = (fontStyle) => {
  const normalized = String(fontStyle || '').toLowerCase();

  if (normalized.includes('jetbrains')) {
    return 'courier';
  }

  if (normalized.includes('georgia') || normalized.includes('merriweather')) {
    return 'times';
  }

  if (
    normalized.includes('outfit') ||
    normalized.includes('montserrat') ||
    normalized.includes('montstret') ||
    normalized.includes('inter') ||
    normalized.includes('helvetica') ||
    normalized.includes('helivica') ||
    normalized.includes('poppins') ||
    normalized.includes('roboto') ||
    normalized.includes('open sans') ||
    normalized.includes('lato') ||
    normalized.includes('nunito') ||
    normalized.includes('source sans')
  ) {
    return 'helvetica';
  }

  return 'helvetica';
};

/** Converts background preference into export-ready hex color and text color values. */
const resolveBackgroundColors = (prefs) => {
  const choice = String(prefs.background || 'dark').toLowerCase();

  if (choice === 'light') {
    return { page: '#ffffff', text: '#111111' };
  }

  if (choice === 'sepia') {
    return { page: '#f4ecd8', text: '#2f2417' };
  }

  if (choice === 'custom' && /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(prefs.customBackground || '')) {
    let raw = String(prefs.customBackground || '').trim().toLowerCase();
    if (raw.length === 4) {
      raw = `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
    }
    const rgb = hexToRgb(raw);
    const luminance = ((0.299 * rgb[0]) + (0.587 * rgb[1]) + (0.114 * rgb[2])) / 255;
    return { page: raw, text: luminance > 0.6 ? '#111111' : '#f5f5f5' };
  }

  return { page: '#18181c', text: '#f5f5f5' };
};

/** Converts a hex color string into RGB tuple values for jsPDF drawing APIs. */
const hexToRgb = (hexColor) => {
  const hex = String(hexColor || '#000000').replace('#', '');

  if (hex.length === 3) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16)
    ];
  }

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ];
};

/** Builds a human-readable export filename from platform and date values. */
const buildFilename = (chat, extension) => {
  const rawPlatform = String(chat?.platform || 'unknown').toLowerCase();
  const platform = rawPlatform.replace(/[^a-z0-9]+/g, '') || 'unknown';
  const date = new Date().toISOString().slice(0, 10);
  return `promptium_${platform}_${date}.${extension}`;
};

/** Converts chat data to markdown with optional metadata controls from prefs. */
const toMarkdown = async (chat, prefs = {}) => {
  const normalizedChat = normalizeChat(chat);
  const options = normalizePrefs(prefs);
  const headerLines = [`# ${normalizedChat.title}`];

  if (options.includePlatformLabel) {
    headerLines.push(`Platform: ${normalizedChat.platform.toUpperCase()}`);
  }

  if (options.includeExportDate) {
    headerLines.push(`Exported: ${new Date().toLocaleString()}`);
  }

  if (options.headerText) {
    headerLines.push('', `## ${options.headerText}`);
  }

  const rows = [];

  if (options.contentMode === 'combined') {
    const combinedText = getCombinedText(normalizedChat);
    rows.push(combinedText);
  } else {
    for (let index = 0; index < normalizedChat.messages.length; index += 1) {
      const message = normalizedChat.messages[index];
      const role = formatRole(message.role);
      const prefix = buildTimestampPrefix(message, options);
      const messageNumber = options.includeMessageNumbers ? `${index + 1}. ` : '';
      const text = String(message.text || '').trim();
      rows.push(`**${messageNumber}${role}:** ${prefix}${text}`);
    }
  }

  const body = rows.join('\n\n---\n\n');
  return `${headerLines.join('\n')}\n\n---\n\n${body}`.trim();
};

/** Converts chat data to plain text with optional metadata controls from prefs. */
const toTXT = async (chat, prefs = {}) => {
  const normalizedChat = normalizeChat(chat);
  const options = normalizePrefs(prefs);
  const divider = '====================';
  const header = [normalizedChat.title];

  if (options.includePlatformLabel) {
    header.push(`Platform: ${normalizedChat.platform.toUpperCase()}`);
  }

  if (options.includeExportDate) {
    header.push(`Exported: ${new Date().toLocaleString()}`);
  }

  if (options.headerText) {
    header.push(options.headerText);
  }

  const rows = [];

  if (options.contentMode === 'combined') {
    rows.push(getCombinedText(normalizedChat));
  } else {
    for (let index = 0; index < normalizedChat.messages.length; index += 1) {
      const message = normalizedChat.messages[index];
      const role = formatRole(message.role);
      const prefix = buildTimestampPrefix(message, options);
      const messageNumber = options.includeMessageNumbers ? `${index + 1}. ` : '';
      const text = String(message.text || '').trim();
      rows.push(`${messageNumber}${role}: ${prefix}${text}`);
    }
  }

  return `${header.join('\n')}\n${divider}\n${rows.join(`\n${divider}\n`)}`.trim();
};

/** Ensures there is enough vertical space on the current PDF page before writing text. */
const ensurePdfSpace = async (doc, y, lineHeight, margin, pageHeight, backgroundRgb) => {
  if (y <= pageHeight - margin) {
    return y;
  }

  doc.addPage();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  return margin + lineHeight;
};

/** Writes wrapped text into a PDF and returns the next y position with overflow handling. */
const writePdfLine = async (doc, text, y, pageHeight, margin, maxWidth, lineHeight, backgroundRgb) => {
  const wrappedLines = doc.splitTextToSize(String(text || ''), maxWidth);
  let nextY = y;

  for (const line of wrappedLines) {
    nextY = await ensurePdfSpace(doc, nextY, lineHeight, margin, pageHeight, backgroundRgb);
    doc.text(line, margin, nextY);
    nextY += lineHeight;
  }

  return nextY;
};

/** Converts chat data into a paginated PDF ArrayBuffer using jsPDF with style prefs. */
const toPDF = async (chat, prefs = {}) => {
  const normalizedChat = normalizeChat(chat);
  const options = normalizePrefs(prefs);

  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error('jsPDF is not loaded in the current context.');
  }

  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = Math.max(16, Math.round(options.fontSize * 1.35));
  const fontFamily = resolvePdfFont(options.fontStyle);
  const colors = resolveBackgroundColors(options);
  const backgroundRgb = hexToRgb(colors.page);
  const textRgb = hexToRgb(colors.text);

  doc.setFillColor(backgroundRgb[0], backgroundRgb[1], backgroundRgb[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(options.fontSize);

  let y = margin;
  y = await writePdfLine(doc, normalizedChat.title, y, pageHeight, margin, maxWidth, lineHeight, backgroundRgb);

  if (options.includePlatformLabel) {
    y = await writePdfLine(
      doc,
      `Platform: ${normalizedChat.platform.toUpperCase()}`,
      y,
      pageHeight,
      margin,
      maxWidth,
      lineHeight,
      backgroundRgb
    );
  }

  if (options.includeExportDate) {
    y = await writePdfLine(doc, `Exported: ${new Date().toLocaleString()}`, y, pageHeight, margin, maxWidth, lineHeight, backgroundRgb);
  }

  if (options.headerText) {
    y = await writePdfLine(doc, options.headerText, y, pageHeight, margin, maxWidth, lineHeight, backgroundRgb);
  }

  y += lineHeight;

  if (options.contentMode === 'combined') {
    const combinedText = getCombinedText(normalizedChat);
    y = await writePdfLine(doc, combinedText, y, pageHeight, margin, maxWidth, lineHeight, backgroundRgb);
  } else {
    for (let index = 0; index < normalizedChat.messages.length; index += 1) {
      const message = normalizedChat.messages[index];
      const role = formatRole(message.role);
      const prefix = buildTimestampPrefix(message, options);
      const messageNumber = options.includeMessageNumbers ? `${index + 1}. ` : '';
      y = await writePdfLine(
        doc,
        `${messageNumber}${role}: ${prefix}${String(message.text || '').trim()}`,
        y,
        pageHeight,
        margin,
        maxWidth,
        lineHeight,
        backgroundRgb
      );
      y += Math.round(lineHeight * 0.55);
    }
  }

  return doc.output('arraybuffer');
};

/** Downloads content as a file via a Blob-backed temporary anchor. */
const downloadBlob = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Routes chat export to markdown, text, or PDF and returns operation status. */
const exportChat = async (chat, format = 'md', prefs = {}) => {
  try {
    const normalized = String(format || 'md').toLowerCase();

    if (normalized === 'md' || normalized === 'markdown') {
      const markdown = await toMarkdown(chat, prefs);
      downloadBlob(markdown, buildFilename(chat, 'md'), 'text/markdown;charset=utf-8');
      return { ok: true };
    }

    if (normalized === 'txt' || normalized === 'text') {
      const text = await toTXT(chat, prefs);
      downloadBlob(text, buildFilename(chat, 'txt'), 'text/plain;charset=utf-8');
      return { ok: true };
    }

    if (normalized === 'pdf') {
      const pdfData = await toPDF(chat, prefs);
      downloadBlob(pdfData, buildFilename(chat, 'pdf'), 'application/pdf');
      return { ok: true };
    }

    return { ok: false, error: `Unsupported export format: ${format}` };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/** Converts chat data to a clean structured JSON string for export. */
const toJSON = async (chat, prefs = {}) => {
  const normalizedChat = normalizeChat(chat);
  const options = normalizePrefs(prefs);
  const output = {
    title: normalizedChat.title,
    exportedAt: options.includeExportDate ? new Date().toISOString() : null,
    messageCount: normalizedChat.messages.length
  };
  if (options.contentMode === 'combined') {
    output.combinedText = getCombinedText(normalizedChat);
  } else {
    output.messages = normalizedChat.messages.map((message, index) => {
      const entry = {
        role: String(message.role || 'unknown').trim(),
        text: String(message.text || '').trim()
      };
      if (options.includeMessageNumbers) entry.number = index + 1;
      return entry;
    });
  }
  if (options.includePlatformLabel) output.platform = normalizedChat.platform;
  if (!options.includeExportDate) delete output.exportedAt;
  if (!options.includePlatformLabel) delete output.platform;
  return JSON.stringify(output, null, 2);
};

/** Converts chat data into clipboard-optimized plain text without dividers. */
const toClipboardText = async (chat, prefs = {}) => {
  const normalizedChat = normalizeChat(chat);
  const options = normalizePrefs(prefs);
  const lines = [normalizedChat.title];

  if (options.includePlatformLabel) {
    lines.push(`Platform: ${normalizedChat.platform}`);
  }
  if (options.includeExportDate) {
    lines.push(`Exported: ${new Date().toLocaleString()}`);
  }
  lines.push('');

  if (options.contentMode === 'combined') {
    lines.push(getCombinedText(normalizedChat));
    lines.push('');
  } else {
    for (let index = 0; index < normalizedChat.messages.length; index += 1) {
      const message = normalizedChat.messages[index];
      const role = formatRole(message.role);
      const prefix = buildTimestampPrefix(message, options);
      const messageNumber = options.includeMessageNumbers ? `${index + 1}. ` : '';
      lines.push(`${messageNumber}${role}: ${prefix}${String(message.text || '').trim()}`);
      lines.push('');
    }
  }

  return lines.join('\n').trim();
};

const Exporter = {
  toMarkdown,
  toTXT,
  toJSON,
  toPDF,
  toClipboardText,
  downloadBlob,
  exportChat
};

if (typeof window !== 'undefined') {
  Object.assign(window, Exporter);
  window.Exporter = Exporter;
}

})();
