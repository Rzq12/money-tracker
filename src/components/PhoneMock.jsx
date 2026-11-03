/** A phone frame cropped by its container. The screens are pictures we drew with sample data. */
export function Phone({ src, alt, frame, border = 8, radius = 40, lazy = false }) {
  return (
    <span
      className="block max-w-full overflow-hidden"
      style={{ width: frame.width, height: frame.height, borderRadius: `${radius}px ${radius}px 0 0`, border: `${border}px solid #111827`, borderBottom: 0, background: '#e1f5fe' }}
    >
      <img src={src} alt={alt} width="499" height="1086" loading={lazy ? 'lazy' : undefined} className="block h-auto w-full" />
    </span>
  );
}
