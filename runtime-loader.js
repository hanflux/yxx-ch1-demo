// Reassemble unchanged exported files from upload-sized pieces (each below 8 MiB).
(() => {
 const originalFetch = window.fetch.bind(window);
 const files = {"index.wasm":{"size":37700666,"parts":[7540134,7540134,7540134,7540134,7540130],"mime":"application/wasm"},"index.pck":{"size":16507300,"parts":[5502434,5502434,5502432],"mime":"application/octet-stream"}};
 const targets = new Map(Object.entries(files).map(([name, config]) => [new URL(name, document.baseURI).href, {name, ...config}]));
 window.fetch = async (input, init) => {
  const target = new URL(input instanceof Request ? input.url : input, document.baseURI).href;
  const file = targets.get(target);
  if (!file) return originalFetch(input, init);
  const chunks = await Promise.all(file.parts.map(async (size, i) => {
   const response = await originalFetch(new URL(file.name + '.part' + (i + 1), document.baseURI), init);
   if (!response.ok) throw new Error('Game download failed: ' + response.status);
   const chunk = await response.arrayBuffer();
   if (chunk.byteLength !== size) throw new Error('Incomplete game download');
   return chunk;
  }));
  const bytes = new Uint8Array(file.size);
  let offset = 0; for (const chunk of chunks) { bytes.set(new Uint8Array(chunk), offset); offset += chunk.byteLength; }
  if (offset !== file.size) throw new Error('Incomplete game file');
  return new Response(bytes, {headers: {'Content-Type': file.mime, 'Content-Length': String(bytes.byteLength)}});
 };
})();
