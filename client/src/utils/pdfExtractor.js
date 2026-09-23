/**
 * Browser-native PDF text extraction utility
 * Uses native DecompressionStream to decompress PDF Flate streams and extract text tokens.
 * Zero external dependencies — fast, lightweight, and works 100% in modern browsers.
 */

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder("latin1");
    const rawString = textDecoder.decode(uint8);

    const extractedTextParts = [];

    // 1. Direct uncompressed text extraction: find (text) Tj and [(text)] TJ
    const textOperatorRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
    let match;
    while ((match = textOperatorRegex.exec(rawString)) !== null) {
      if (match[1]) {
        extractedTextParts.push(cleanPdfToken(match[1]));
      } else if (match[2]) {
        const inner = match[2];
        const innerRegex = /\(([^)]+)\)/g;
        let innerMatch;
        while ((innerMatch = innerRegex.exec(inner)) !== null) {
          extractedTextParts.push(cleanPdfToken(innerMatch[1]));
        }
      }
    }

    // 2. Scan for FlateDecode streams and decompress them using browser DecompressionStream
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch;

    while ((streamMatch = streamRegex.exec(rawString)) !== null) {
      const streamStart = streamMatch.index + streamMatch[0].indexOf("\n") + 1;
      const streamEnd = streamMatch.index + streamMatch[0].lastIndexOf("endstream") - 1;
      if (streamStart < streamEnd) {
        const streamBytes = uint8.slice(streamStart, streamEnd);
        try {
          const decompressed = await decompressFlate(streamBytes);
          if (decompressed) {
            const decompressedStr = new TextDecoder("utf-8", { fatal: false }).decode(decompressed);
            let sMatch;
            const subRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
            while ((sMatch = subRegex.exec(decompressedStr)) !== null) {
              if (sMatch[1]) {
                extractedTextParts.push(cleanPdfToken(sMatch[1]));
              } else if (sMatch[2]) {
                const subInner = sMatch[2];
                const subInnerRegex = /\(([^)]+)\)/g;
                let subMatch;
                while ((subMatch = subInnerRegex.exec(subInner)) !== null) {
                  extractedTextParts.push(cleanPdfToken(subMatch[1]));
                }
              }
            }
          }
        } catch (e) {
          // Stream might not be deflate or already decompressed
        }
      }
    }

    // Combine and structure text lines
    let combined = extractedTextParts
      .join(" ")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // If text operators weren't captured well, scan for plain printable alphanumeric sequences
    if (combined.length < 50) {
      const printable = rawString
        .replace(/[^\x20-\x7E\n\r]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      combined = printable.slice(0, 10000);
    }

    return combined;
  } catch (err) {
    console.warn("PDF extraction warning:", err);
    throw new Error("Could not extract readable text from PDF: " + err.message);
  }
}

function cleanPdfToken(token) {
  return token
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .trim();
}

async function decompressFlate(bytes) {
  if (typeof DecompressionStream === "undefined") return null;

  try {
    // Try standard deflate
    const ds = new DecompressionStream("deflate");
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();

    const chunks = [];
    const reader = ds.readable.getReader();
    let done, value;
    while (!({ done, value } = await reader.read()).done) {
      chunks.push(value);
    }

    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
    const result = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  } catch (err) {
    try {
      // Try deflate-raw if headers differ
      const dsRaw = new DecompressionStream("deflate-raw");
      const writer = dsRaw.writable.getWriter();
      writer.write(bytes.slice(2)); // strip zlib header
      writer.close();

      const chunks = [];
      const reader = dsRaw.readable.getReader();
      let done, value;
      while (!({ done, value } = await reader.read()).done) {
        chunks.push(value);
      }

      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const result = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result;
    } catch (e) {
      return null;
    }
  }
}
