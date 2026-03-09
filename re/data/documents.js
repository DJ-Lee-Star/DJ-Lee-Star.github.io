const res = await fetch('../data/documents.json');
export const documents = await res.json();
