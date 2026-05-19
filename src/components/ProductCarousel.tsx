"use client";

import { memo, useEffect, useRef, useState, useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  category?: string;
  imagePaths: string[];
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
const PRODUCT_MESSAGE_TEMPLATE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE_PRODUCT || '';

/**
 * Lazy image: solo monta el <img> cuando la tarjeta entra en viewport,
 * muestra spinner hasta onLoad y cachea los src ya decodificados para
 * evitar re-decodificar base64 al cambiar de slide.
 */
const decodedCache = new Set<string>();

const LazyImage = memo(function LazyImage({
  src,
  alt,
  active,
  visible,
}: {
  src: string;
  alt: string;
  active: boolean;
  visible: boolean;
}) {
  const [loaded, setLoaded] = useState(() => decodedCache.has(src));

  useEffect(() => {
    setLoaded(decodedCache.has(src));
  }, [src]);

  const shouldLoad = visible && (active || loaded);

  useEffect(() => {
    if (!shouldLoad || loaded) return;
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    const done = () => {
      if (cancelled) return;
      decodedCache.add(src);
      setLoaded(true);
    };
    if (img.decode) {
      img.decode().then(done).catch(done);
    } else {
      img.onload = done;
      img.onerror = done;
    }
    return () => {
      cancelled = true;
    };
  }, [src, shouldLoad, loaded]);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      )}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            decodedCache.add(src);
            setLoaded(true);
          }}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </>
  );
});

function ProductImages({ images, name }: { images?: string[]; name: string }) {
  const safeImages = images ?? [];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = safeImages.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  useEffect(() => {
    if (!ref.current || visible) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted"
    >
      {total === 0 && (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
          Sin imagen
        </div>
      )}
      {safeImages.map((src, i) => (

        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-300 ${
            i === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <LazyImage
            src={src}
            alt={`${name} - imagen ${i + 1}`}
            active={i === idx}
            visible={visible}
          />
        </div>
      ))}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur text-foreground shadow-soft hover:bg-background transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur text-foreground shadow-soft hover:bg-background transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 flex gap-1.5">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-6 bg-primary" : "w-2 bg-background/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const waUrl = useMemo(() => {
    const rawMessage = PRODUCT_MESSAGE_TEMPLATE
      .replace("{name}", product.name)
      .replace("{price}", product.price);
    const message = encodeURIComponent(rawMessage);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }, [product.name, product.price]);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft">
      <ProductImages images={product.imagePaths} name={product.name} />
      <div className="flex flex-1 flex-col gap-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            {product.category && (
              <Badge variant="secondary" className="mb-2 rounded-full">
                {product.category}
              </Badge>
            )}
            <h3 className="text-2xl leading-tight text-foreground">{product.name}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            {product.price}
          </span>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">{product.description}</p>
        <Button
          asChild
          size="lg"
          className="mt-2 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95"
        >
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-2 h-5 w-5" />
            Pedir por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-4">
        {products.map((p) => (
          <CarouselItem
            key={p.id}
            className="pl-4 sm:basis-1/2 lg:basis-1/3"
          >
            <ProductCard product={p} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4 h-12 w-12 bg-card shadow-soft" />
      <CarouselNext className="hidden md:flex -right-4 h-12 w-12 bg-card shadow-soft" />
    </Carousel>
  );
}
