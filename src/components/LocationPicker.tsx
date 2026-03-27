import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search, X, Loader2, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ─── Fix Leaflet's broken default marker icons when bundled with Vite ─── */
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

/* ─── Custom green pin icon ──────────────────────────────────────────── */
const greenIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:32px;height:40px;position:relative;
  ">
    <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
      <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 28 12 28s12-19 12-28C28 5.373 22.627 0 16 0z" fill="#005234"/>
      <circle cx="16" cy="12" r="5" fill="white"/>
    </svg>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

/* ─── types ──────────────────────────────────────────── */
export interface PinLocation {
  lat: number;
  lng: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: { road?: string; suburb?: string; city?: string; country?: string };
}

interface Props {
  /** Initial pin position (from saved experience) */
  initialLat?: number | null;
  initialLng?: number | null;
  /** Called whenever the pin moves or search selects a result */
  onChange: (loc: PinLocation) => void;
  disabled?: boolean;
}

/* ─── Default center: Addis Ababa ────────────────────── */
const DEFAULT_LAT = 9.0054;
const DEFAULT_LNG = 38.7636;
const DEFAULT_ZOOM = 13;

export default function LocationPicker({ initialLat, initialLng, onChange, disabled = false }: Props) {
  const mapRef     = useRef<L.Map | null>(null);
  const markerRef  = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pinned, setPinned] = useState<PinLocation | null>(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng, displayName: "" }
      : null
  );
  const [searchQuery, setSearchQuery]   = useState("");
  const [results, setResults]           = useState<NominatimResult[]>([]);
  const [searching, setSearching]       = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  /* ── Reverse-geocode a coordinate ── */
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await r.json() as NominatimResult;
      return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  /* ── Place / move the marker ── */
  const placePin = useCallback((lat: number, lng: number, name: string) => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const m = L.marker([lat, lng], { icon: greenIcon, draggable: !disabled });
      m.addTo(map);

      m.on("dragend", async () => {
        const pos = m.getLatLng();
        setReverseLoading(true);
        const name = await reverseGeocode(pos.lat, pos.lng);
        setReverseLoading(false);
        const loc = { lat: pos.lat, lng: pos.lng, displayName: name };
        setPinned(loc);
        onChange(loc);
      });

      markerRef.current = m;
    }

    const loc = { lat, lng, displayName: name };
    setPinned(loc);
    onChange(loc);
  }, [disabled, onChange, reverseGeocode]);

  /* ── Init map (once) ── */
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const startLat = initialLat ?? DEFAULT_LAT;
    const startLng = initialLng ?? DEFAULT_LNG;

    const map = L.map(containerRef.current, {
      center: [startLat, startLng],
      zoom: initialLat ? 15 : DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    /* Place initial pin if coordinates provided */
    if (initialLat && initialLng) {
      reverseGeocode(initialLat, initialLng).then((name) => {
        placePin(initialLat, initialLng, name);
      });
    }

    /* Click to drop pin */
    if (!disabled) {
      map.on("click", async (e: L.LeafletMouseEvent) => {
        setReverseLoading(true);
        const name = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        setReverseLoading(false);
        placePin(e.latlng.lat, e.latlng.lng, name);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Nominatim search (debounced) ── */
  useEffect(() => {
    if (searchQuery.trim().length < 3) { setResults([]); return; }
    const id = window.setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=et,ke,ug,tz,ss,sd`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await r.json() as NominatimResult[];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  /* ── Select a search result ── */
  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    placePin(lat, lng, r.display_name);
    mapRef.current?.flyTo([lat, lng], 16, { duration: 1 });
    setSearchQuery(r.display_name.split(",").slice(0, 2).join(","));
    setResults([]);
  };

  /* ── Use device location ── */
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setReverseLoading(true);
      const name = await reverseGeocode(lat, lng);
      setReverseLoading(false);
      placePin(lat, lng, name);
      mapRef.current?.flyTo([lat, lng], 16, { duration: 1 });
    });
  };

  return (
    <div className="space-y-3">

      {/* Search bar */}
      {!disabled && (
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a place…"
              className="w-full pl-10 pr-20 py-2.5 bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:border-green-400/50 transition-all placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searching && <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-green-400" />}
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(""); setResults([]); }}
                  className="p-1 rounded-lg hover:bg-surface-container dark:hover:bg-zinc-700 transition-colors">
                  <X className="h-3.5 w-3.5 text-on-surface-variant" />
                </button>
              )}
              <button type="button" onClick={useMyLocation} title="Use my location"
                className="p-1.5 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                <Navigation className="h-3.5 w-3.5 text-primary dark:text-green-400" />
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-outline-variant/20 dark:border-zinc-700 overflow-hidden max-h-56 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-surface-container dark:hover:bg-zinc-700 transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 text-primary dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-on-surface dark:text-white line-clamp-2 leading-snug">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-outline-variant/15 dark:border-zinc-700 shadow-sm">
        <div ref={containerRef} style={{ height: "300px", width: "100%" }} />

        {/* Loading overlay for reverse geocode */}
        {reverseLoading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 text-xs font-semibold text-on-surface dark:text-white px-3 py-1.5 rounded-full shadow-md border border-outline-variant/20 dark:border-zinc-700 z-[1000]">
            <Loader2 className="h-3 w-3 animate-spin text-primary dark:text-green-400" />
            Looking up address…
          </div>
        )}

        {/* Instruction hint */}
        {!pinned && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
            <div className="bg-white/90 dark:bg-zinc-900/90 px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-outline-variant/20 dark:border-zinc-700">
              <MapPin className="h-4 w-4 text-primary dark:text-green-400 fill-primary/20" />
              <span className="font-bold text-primary dark:text-green-400 text-sm">Click map to drop a pin</span>
            </div>
          </div>
        )}

        {/* Attribution */}
        <p className="absolute bottom-1 right-1 text-[9px] text-zinc-400 bg-white/70 dark:bg-zinc-900/70 px-1.5 py-0.5 rounded pointer-events-none z-[1000]">
          © OpenStreetMap contributors
        </p>
      </div>

      {/* Pinned location summary */}
      {pinned && pinned.displayName && (
        <div className="flex items-start gap-2 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-green-500/20 rounded-xl">
          <MapPin className="h-4 w-4 text-primary dark:text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary dark:text-green-400 mb-0.5">Pinned location</p>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 line-clamp-2 leading-relaxed">{pinned.displayName}</p>
            <p className="text-[10px] text-on-surface-variant/60 dark:text-zinc-600 mt-0.5 font-mono">
              {pinned.lat.toFixed(6)}, {pinned.lng.toFixed(6)}
            </p>
          </div>
          {!disabled && (
            <button type="button" onClick={() => {
              if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
              setPinned(null);
              onChange({ lat: 0, lng: 0, displayName: "" });
            }} className="p-1 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors shrink-0">
              <X className="h-3.5 w-3.5 text-primary dark:text-green-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
