/**
 * Generates a compliant multi-page PDF ArrayBuffer for testing 200-page reader benchmarks
 */
export function generateBenchmarkPdf(pageCount = 200): ArrayBuffer {
  const chunks: string[] = [];
  chunks.push('%PDF-1.4\n');

  const objects: number[] = [];
  let offset = chunks.join('').length;

  function addObject(content: string): number {
    const objNum = objects.length + 1;
    objects.push(offset);
    const str = `${objNum} 0 obj\n${content}\nendobj\n`;
    chunks.push(str);
    offset += str.length;
    return objNum;
  }

  // 1: Font
  addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  // We will create pages
  const pageObjNums: number[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const stream = `BT /F1 18 Tf 50 720 Td (StudyVault Benchmark Document - Page ${i} of ${pageCount}) Tj ET\n` +
      `BT /F1 12 Tf 50 680 Td (TCP Congestion Control & Flow Allocation - Chapter ${Math.ceil(i / 10)}) Tj ET\n` +
      `BT /F1 10 Tf 50 640 Td (Key Concept: Window-based flow control maintains maximum throughput without bufferbloat.) Tj ET\n` +
      `BT /F1 10 Tf 50 610 Td (Formula: Throughput <= MSS / (RTT * sqrt(p)) where p is the packet loss rate.) Tj ET\n` +
      `BT /F1 10 Tf 50 580 Td (Exam Question: Explain the difference between AIMD and Cubic congestion avoidance curves.) Tj ET\n` +
      `BT /F1 10 Tf 50 540 Td (Definition: Slow Start doubles the congestion window every round-trip time.) Tj ET\n` +
      `BT /F1 9 Tf 50 80 Td (Generated for StudyVault 60FPS Reader Memory & Performance Benchmark) Tj ET`;

    const streamLength = stream.length;
    const contentsObj = addObject(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);

    // Page object (parent will be Pages object = 2)
    const pageObj = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentsObj} 0 R /Resources << /Font << /F1 1 0 R >> >> >>`);
    pageObjNums.push(pageObj);
  }

  // 2: Pages Catalog (Must know children)
  // Let's rewrite or inject Pages catalog
  const pagesKids = pageObjNums.map(n => `${n} 0 R`).join(' ');
  const pagesObj = `<< /Type /Pages /Kids [${pagesKids}] /Count ${pageCount} >>`;
  
  // Re-generate properly
  const finalChunks: string[] = ['%PDF-1.4\n'];
  const finalOffsets: number[] = [];
  let currentOffset = finalChunks[0].length;

  function addFinalObj(content: string) {
    const num = finalOffsets.length + 1;
    finalOffsets.push(currentOffset);
    const str = `${num} 0 obj\n${content}\nendobj\n`;
    finalChunks.push(str);
    currentOffset += str.length;
    return num;
  }

  // 1: Font
  addFinalObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  // 2: Pages container
  addFinalObj(pagesObj);
  // 3: Root Catalog
  addFinalObj(`<< /Type /Catalog /Pages 2 0 R >>`);

  // Add pages and streams
  for (let i = 1; i <= pageCount; i++) {
    const textContent = `BT /F1 18 Tf 50 720 Td (StudyVault Benchmark - Page ${i} of ${pageCount}) Tj ET\n` +
      `BT /F1 12 Tf 50 680 Td (Distributed Systems & Consensus Protocols: Module ${Math.ceil(i / 8)}) Tj ET\n` +
      `BT /F1 10 Tf 50 640 Td (High-yield note: Paxos ensures safety under asynchronous networks with crash failures.) Tj ET\n` +
      `BT /F1 10 Tf 50 610 Td (Raft breaks consensus into Leader Election, Log Replication, and Safety invariants.) Tj ET\n` +
      `BT /F1 10 Tf 50 570 Td (Select this sentence to test Explain, Quiz Me, or Save to Note selection popup!) Tj ET\n` +
      `BT /F1 10 Tf 50 530 Td (Exam tip: Always verify that a quorum consists of at least floor(N/2) + 1 nodes.) Tj ET\n` +
      `BT /F1 9 Tf 50 50 Td (StudyVault Performance Benchmark - Smooth 60fps Lazy Reader) Tj ET`;

    const streamLen = textContent.length;
    const streamObjNum = addFinalObj(`<< /Length ${streamLen} >>\nstream\n${textContent}\nendstream`);
    addFinalObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${streamObjNum} 0 R /Resources << /Font << /F1 1 0 R >> >> >>`);
  }

  const xrefOffset = currentOffset;
  finalChunks.push(`xref\n0 ${finalOffsets.length + 1}\n0000000000 65535 f \n`);
  for (const off of finalOffsets) {
    finalChunks.push(`${off.toString().padStart(10, '0')} 00000 n \n`);
  }

  finalChunks.push(`trailer\n<< /Size ${finalOffsets.length + 1} /Root 3 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const fullPdfStr = finalChunks.join('');
  const encoder = new TextEncoder();
  const uint8 = encoder.encode(fullPdfStr);
  return uint8.buffer;
}
