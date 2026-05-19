import { Heart, Sparkles, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel, type Product } from "@/components/ProductCarousel";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export const metadata = {
  title: "Zoso Design — Joyería artesanal hecha a mano",
  description: "Cadenitas, pulseras y anillos únicos hechos a mano con amor.",
};

async function getProducts(): Promise<Product[]> {
  const API_URL = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/products` 
    : "http://localhost:3000/api/products";
    
  try {
    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) return [];
    return (await response.json()) as Product[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const WHATSAPP_NUMBER = "5491158803730";
  const generalWa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "¡Hola Zoso Design! 💖 Me gustaría conocer más sobre sus productos."
  )}`;

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="#top" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl text-foreground">Zoso Design</span>
          </a>
          <nav className="hidden gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#productos" className="hover:text-primary transition">Productos</a>
            <a href="#nosotros" className="hover:text-primary transition">Nosotros</a>
            <a href="#contacto" className="hover:text-primary transition">Contacto</a>
          </nav>
          <Button asChild size="sm" className="rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
            <a href={generalWa} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="mr-1 h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      </header>

      <section id="top" className="relative bg-gradient-hero">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute top-32 right-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-secondary/40 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-4 text-center md:py-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm font-semibold text-foreground shadow-soft backdrop-blur">
            <Heart className="h-4 w-4 text-primary" /> Hecho a mano con amor
          </div>
          <h1 className="mt-6 text-5xl leading-tight text-foreground md:text-7xl">
            Joyitas únicas<br /><span className="text-primary">hechas con el corazón</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-gradient-primary text-primary-foreground shadow-soft text-base">
              <a href="#productos">Ver productos</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-2 bg-card/70 backdrop-blur text-base">
              <a href={generalWa} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5" /> Escribinos
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="productos" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-4 py-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4" /> Nuestra colección
          </span>
          <h2 className="mt-3 text-4xl text-foreground md:text-5xl">Productos destacados</h2>
        </div>
        <ProductCarousel products={products} />
      </section>

      <section id="contacto" className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-4xl text-foreground md:text-5xl">¿Lista para tu joyita?</h2>
        <Button asChild size="lg" className="mt-8 rounded-full bg-gradient-primary text-primary-foreground shadow-soft text-base">
          <a href={generalWa} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-2 h-5 w-5" /> Pedir por WhatsApp
          </a>
        </Button>
      </section>

      <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} <span className="font-display text-foreground">Zoso Design</span> — Hecho a mano con 💖</p>
      </footer>

      <a href={generalWa} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp" className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#20bd5a]">
        <WhatsAppIcon className="h-8 w-8" />
      </a>
    </div>
  );
}