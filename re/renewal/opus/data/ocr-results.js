const res = await fetch('../data/ocr-results.json');
export const ocrResults = await res.json();
