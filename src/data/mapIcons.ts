import L from 'leaflet';

const makeIcon = (bg: string, border: string, svgPath: string) =>
  L.divIcon({
    html: `<div style="background:${bg};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid ${border};box-shadow:0 3px 8px rgba(0,0,0,0.25);">${svgPath}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
    tooltipAnchor: [0, -38],
  });

const MUSEUM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
const LIBRARY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

// Müze ikonları - light/dark
export const museumIconLight = makeIcon('#4f46e5', '#ffffff', `<span style="color:white">${MUSEUM_SVG}</span>`);
export const museumIconDark  = makeIcon('#818cf8', '#1e1b4b', `<span style="color:#1e1b4b">${MUSEUM_SVG}</span>`);

// Kütüphane ikonları - light/dark
export const libraryIconLight = makeIcon('#0d9488', '#ffffff', `<span style="color:white">${LIBRARY_SVG}</span>`);
export const libraryIconDark  = makeIcon('#2dd4bf', '#042f2e', `<span style="color:#042f2e">${LIBRARY_SVG}</span>`);

export function getIcon(isLibrary: boolean, isDark: boolean) {
  if (isLibrary) return isDark ? libraryIconDark : libraryIconLight;
  return isDark ? museumIconDark : museumIconLight;
}
