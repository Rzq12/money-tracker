const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Gambar tidak bisa dibaca.'));
  };
  image.src = url;
});

/**
 * Camera photos are stored in localStorage, so downscale until the data URL fits
 * comfortably inside the browser quota.
 */
export const compressImage = async (file, { maxDimension = 1200, maxBytes = 180000 } = {}) => {
  if (!file || !/^image\//.test(file.type)) throw new Error('Pilih file gambar.');
  const image = await loadImage(file);
  let scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  let quality = 0.72;
  let dataUrl = '';
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (Math.ceil((dataUrl.length - 22) * 0.75) <= maxBytes) break;
    quality = Math.max(0.4, quality - 0.1);
    scale *= 0.82;
  }
  return dataUrl;
};
