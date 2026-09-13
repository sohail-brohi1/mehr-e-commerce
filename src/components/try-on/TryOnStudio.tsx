import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type TouchEvent, type TouchList } from "react";
import { Link } from "react-router-dom";
import { Download, RotateCcw, Sparkles, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { formatPKR, priceOf, type CategorySlug, type Product } from "@/services/catalog";
import { useShop } from "@/store/shop";
import {
  FIT_PRESETS,
  HOUSE_BODIES,
  defaultBody,
  garmentImage,
  getRememberedUpload,
  maskFor,
  proxiedSrc,
  setRememberedUpload,
  type GarmentFit,
  type HouseBody,
} from "@/services/try-on";

type Props = {
  product: Product;
  others: Product[];
};

export function TryOnStudio({ product, others }: Props) {
  const { addToCart } = useShop();
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ pointer: number; x: number; y: number; fitX: number; fitY: number } | null>(null);
  const pinch = useRef<{ distance: number; scale: number } | null>(null);

  const [house, setHouse] = useState<HouseBody>(() => defaultBody(product.category));
  const [upload, setUpload] = useState<string | null>(() => getRememberedUpload());
  const [fit, setFit] = useState<GarmentFit>(() => ({ ...FIT_PRESETS[product.category] }));
  const [holdCompare, setHoldCompare] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  const bodySrc = upload ?? house.src;
  const cloth = garmentImage(product, colorIndex);
  const mask = maskFor(product.category);
  const tint = product.colors[colorIndex]?.hex;

  useEffect(() => {
    setFit({ ...FIT_PRESETS[product.category] });
    setColorIndex(0);
    setHouse((current) =>
      current.for.includes(product.category) ? current : defaultBody(product.category),
    );
  }, [product.id, product.category]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { pointer: e.pointerId, x: e.clientX, y: e.clientY, fitX: fit.x, fitY: fit.y };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || !drag.current || drag.current.pointer !== e.pointerId) return;
    const rect = stage.getBoundingClientRect();
    const dx = ((e.clientX - drag.current.x) / rect.width) * 100;
    const dy = ((e.clientY - drag.current.y) / rect.height) * 100;
    setFit((f) => ({
      ...f,
      x: clamp(drag.current!.fitX + dx, 8, 92),
      y: clamp(drag.current!.fitY + dy, 0, 72),
    }));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer === e.pointerId) drag.current = null;
    pinch.current = null;
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2) return;
    pinch.current = { distance: touchDistance(e.touches), scale: fit.scale };
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 2 || !pinch.current) return;
    e.preventDefault();
    const next = touchDistance(e.touches);
    const ratio = next / pinch.current.distance;
    setFit((f) => ({ ...f, scale: clamp(pinch.current!.scale * ratio, 36, 130) }));
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please choose a photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("Keep the photo under 10 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setRememberedUpload(url);
    setUpload(url);
    toast("Photo added — it stays on this device.");
  };

  const clearUpload = () => {
    setRememberedUpload(null);
    setUpload(null);
  };

  const saveLook = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      const blob = await rasterizeStage(bodySrc, cloth, fit, product.category, tint);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `mehr-try-on-${product.slug}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Look saved to your downloads.");
    } catch {
      toast("Couldn't save that still. Try another photo, or screenshot the stage.");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-7">
        <div
          ref={stageRef}
          className="relative aspect-[3/4] overflow-hidden bg-cream touch-none select-none"
        >
          <img
            src={bodySrc}
            alt="Body for try-on"
            className="absolute inset-0 h-full w-full object-cover object-top"
            draggable={false}
          />
          {!holdCompare && cloth && (
            <div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${fit.x}%`,
                top: `${fit.y}%`,
                width: `${fit.scale}%`,
                transform: `translate(-50%, 0) rotate(${fit.rotate}deg)`,
                opacity: fit.opacity / 100,
                mixBlendMode: "multiply",
                WebkitMaskImage: `url("${mask}")`,
                maskImage: `url("${mask}")`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center top",
                maskPosition: "center top",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
            >
              <div className="relative">
                <img
                  src={cloth}
                  alt=""
                  draggable={false}
                  className="pointer-events-none w-full select-none"
                />
                {tint && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundColor: tint, mixBlendMode: "color", opacity: 0.28 }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
          )}
          <p className="label-xs pointer-events-none absolute inset-x-0 bottom-4 text-center text-ivory/90 drop-shadow">
            Drag to place · pinch or slider to size
          </p>
        </div>
        <button
          type="button"
          className="label-xs mt-3 w-full border py-3 text-muted-foreground"
          onPointerDown={() => setHoldCompare(true)}
          onPointerUp={() => setHoldCompare(false)}
          onPointerLeave={() => setHoldCompare(false)}
        >
          Hold to see the body only
        </button>
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-28">
        <span className="label-xs text-muted-foreground">Try on</span>
        <h1 className="font-display mt-3 text-3xl leading-tight md:text-5xl">{product.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Drape this piece on a real body — an atelier model, or a photo of you. Your picture never
          leaves this device.
        </p>
        <p className="mt-2 text-sm">{formatPKR(priceOf(product))}</p>

        <div className="mt-8">
          <span className="label-xs text-muted-foreground">The body</span>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {HOUSE_BODIES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  clearUpload();
                  setHouse(b);
                }}
                className={`overflow-hidden border ${
                  !upload && house.id === b.id ? "border-charcoal" : "border-transparent"
                }`}
              >
                <img src={b.src} alt={b.label} className="aspect-[3/4] w-full object-cover object-top" />
                <span className="label-xs block py-1.5 text-center text-[0.55rem]">{b.label}</span>
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`label-xs mt-3 flex min-h-11 w-full items-center justify-center gap-2 border py-3 ${
              upload ? "border-charcoal" : "border-border"
            }`}
          >
            {upload ? <UserRound className="h-4 w-4" strokeWidth={1.2} /> : <Upload className="h-4 w-4" strokeWidth={1.2} />}
            {upload ? "Using your photo" : "Use your photo"}
          </button>
        </div>

        {product.colors.length > 1 && (
          <div className="mt-8">
            <span className="label-xs text-muted-foreground">Colour</span>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => setColorIndex(i)}
                  className={`h-8 w-8 rounded-full border ${
                    colorIndex === i ? "ring-1 ring-espresso ring-offset-2 ring-offset-background" : "border-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-5">
          <Slider
            label="Size"
            min={36}
            max={130}
            value={fit.scale}
            onChange={(scale) => setFit((f) => ({ ...f, scale }))}
          />
          <Slider
            label="Move down"
            min={0}
            max={72}
            value={fit.y}
            onChange={(y) => setFit((f) => ({ ...f, y }))}
          />
          <Slider
            label="Turn"
            min={-28}
            max={28}
            value={fit.rotate}
            onChange={(rotate) => setFit((f) => ({ ...f, rotate }))}
          />
          <Slider
            label="Presence"
            min={55}
            max={100}
            value={fit.opacity}
            onChange={(opacity) => setFit((f) => ({ ...f, opacity }))}
          />
        </div>

        <button
          type="button"
          onClick={() => setFit({ ...FIT_PRESETS[product.category] })}
          className="label-xs mt-4 flex items-center gap-2 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.2} />
          Reset the drape
        </button>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => {
              addToCart(
                product,
                product.sizes[0] ?? "One size",
                product.colors[colorIndex]?.name ?? product.colors[0]?.name ?? "Natural",
              );
              toast("Added to your bag");
            }}
            className="label-xs flex-1 bg-charcoal py-4 text-ivory disabled:opacity-40"
          >
            {product.stock <= 0 ? "Sold out" : "Add to bag"}
          </button>
          <button
            type="button"
            onClick={() => void saveLook()}
            className="label-xs flex min-h-11 items-center justify-center gap-2 border px-5 py-4"
          >
            <Download className="h-4 w-4" strokeWidth={1.2} />
            Save look
          </button>
        </div>

        <Link to={`/products/${product.slug}`} className="label-xs mt-6 inline-block text-muted-foreground">
          Back to the piece
        </Link>
      </div>

      {others.length > 0 && (
        <div className="lg:col-span-12">
          <div className="flex items-end justify-between border-b pb-4">
            <h2 className="font-display text-2xl md:text-4xl">Try another piece</h2>
            <span className="label-xs hidden text-muted-foreground sm:block">
              <Sparkles className="mr-1 inline h-3 w-3" strokeWidth={1.2} />
              Same body, new cloth
            </span>
          </div>
          <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-2">
            {others.map((p) => (
              <Link key={p.id} to={`/try-on/${p.slug}`} className="w-28 flex-none sm:w-36">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className={`aspect-[4/5] w-full object-cover ${p.id === product.id ? "ring-1 ring-charcoal" : ""}`}
                />
                <span className="mt-2 block text-[0.75rem] leading-snug">{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="label-xs flex justify-between text-muted-foreground">
        {label}
        <span>{Math.round(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--burgundy)]"
      />
    </label>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function touchDistance(touches: TouchList) {
  const a = touches.item(0);
  const b = touches.item(1);
  if (!a || !b) return 0;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

async function rasterizeStage(
  bodySrc: string,
  clothSrc: string,
  fit: GarmentFit,
  category: CategorySlug,
  tint: string | undefined,
) {
  const width = 900;
  const height = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const [body, cloth, mask] = await Promise.all([
    loadImg(proxiedSrc(bodySrc)),
    loadImg(clothSrc),
    loadImg(maskFor(category)),
  ]);

  coverDraw(ctx, body, width, height);

  const gw = (fit.scale / 100) * width;
  const gh = gw * (cloth.naturalHeight / cloth.naturalWidth || 1.4);
  const gx = (fit.x / 100) * width - gw / 2;
  const gy = (fit.y / 100) * height;

  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const ltx = layer.getContext("2d");
  if (!ltx) throw new Error("layer");
  ltx.save();
  ltx.translate(gx + gw / 2, gy);
  ltx.rotate((fit.rotate * Math.PI) / 180);
  ltx.drawImage(cloth, -gw / 2, 0, gw, gh);
  if (tint) {
    ltx.globalCompositeOperation = "color";
    ltx.fillStyle = tint;
    ltx.globalAlpha = 0.28;
    ltx.fillRect(-gw / 2, 0, gw, gh);
    ltx.globalAlpha = 1;
    ltx.globalCompositeOperation = "source-over";
  }
  ltx.restore();
  ltx.globalCompositeOperation = "destination-in";
  ltx.drawImage(mask, gx, gy, gw, gh);

  ctx.globalAlpha = fit.opacity / 100;
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(layer, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}

function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = w / h;
  let dw = w;
  let dh = h;
  let dx = 0;
  let dy = 0;
  if (ir > cr) {
    dw = h * ir;
    dx = (w - dw) / 2;
  } else {
    dh = w / ir;
    dy = (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}
