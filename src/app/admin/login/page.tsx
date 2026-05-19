"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pwd }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión al intentar iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card">
        <div className="mb-8 flex flex-col items-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Zoso Admin</h1>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Usuario</label>
            <input type="text" value={user} onChange={(e) => setUser(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Contraseña</label>
            <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors" required />
          </div>
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          <Button type="submit" disabled={isLoading} className="mt-2 w-full rounded-full bg-gradient-primary py-6 text-primary-foreground shadow-soft text-base hover:opacity-95">
            {isLoading ? "Iniciando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
