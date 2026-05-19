"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Home, Edit, Trash2, Plus, X, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/components/ProductCarousel";

export default function AdminPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [messageModal, setMessageModal] = useState({ isOpen: false, title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        id: Date.now().toString(),
        name: "",
        description: "",
        price: "Consultar",
        category: "",
        imagePaths: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({});
  };

  const saveToBackend = async (updatedProducts: Product[], action: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProducts),
      });
      if (!response.ok) throw new Error("Error al guardar");
      setProducts(updatedProducts);
      handleCloseModal();
      setMessageModal({ isOpen: true, title: "Éxito", message: `Producto ${action} con éxito.` });
    } catch (error) {
      console.error(error);
      setMessageModal({ isOpen: true, title: "Error", message: "Hubo un error al guardar los cambios." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar producto",
      message: "¿Estás seguro de que deseas eliminar este producto?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const updatedProducts = products.filter((p) => p.id !== id);
        await saveToBackend(updatedProducts, "eliminado");
      }
    });
  };

  const handleSave = async () => {
    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = products.map((p) => p.id === editingProduct.id ? (formData as Product) : p);
    } else {
      updatedProducts = [formData as Product, ...products];
    }
    await saveToBackend(updatedProducts, editingProduct ? "actualizado" : "agregado");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagePaths: [...(formData.imagePaths || []), reader.result as string] });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  if (isLoading) return <div className="p-8 text-center min-h-screen text-foreground">Cargando productos...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-2xl font-semibold">Administración Zoso</span>
          <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <Link href="/"><Home className="h-5 w-5" /></Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-medium">Catálogo de Productos</h1>
          <Button onClick={() => handleOpenModal()} className="rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
            <Plus className="mr-2 h-4 w-4" /> Agregar producto
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted mb-4">
                {product.imagePaths && product.imagePaths[0] ? (
                  <img src={product.imagePaths[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="truncate text-xl font-medium leading-tight">{product.name}</h3>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-border/50 pt-4">
                <Button variant="outline" size="icon" onClick={() => handleOpenModal(product)} className="h-10 w-10 rounded-full"><Edit className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)} className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white border-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseModal} className="h-8 w-8 rounded-full hover:bg-accent"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Nombre</label><input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Precio</label><input type="text" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Categoría</label><input type="text" value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Descripción</label><textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-20 w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Imágenes</label>
                {formData.imagePaths && formData.imagePaths.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {formData.imagePaths.map((src, idx) => (
                      <div key={idx} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <img src={src} alt="preview" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Eliminar imagen",
                            message: "¿Estás seguro de que deseas eliminar esta imagen?",
                            onConfirm: () => {
                              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              const newPaths = [...formData.imagePaths!];
                              newPaths.splice(idx, 1);
                              setFormData({ ...formData, imagePaths: newPaths });
                            }
                          });
                        }} className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white hover:bg-red-500"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl px-4"><Upload className="mr-2 h-4 w-4" /> Subir imagen</Button>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseModal} className="rounded-full px-6">Cancelar</Button>
                <Button onClick={handleSave} className="rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-soft">Guardar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">{confirmModal.title}</h2>
            <p className="text-muted-foreground mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))} className="rounded-full px-6">Cancelar</Button>
              <Button onClick={confirmModal.onConfirm} className="rounded-full bg-red-500 hover:bg-red-600 text-white px-6">Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-xl text-center">
            <h2 className="text-xl font-semibold mb-2">{messageModal.title}</h2>
            <p className="text-muted-foreground mb-6">{messageModal.message}</p>
            <Button onClick={() => setMessageModal((prev) => ({ ...prev, isOpen: false }))} className="rounded-full bg-gradient-primary px-8 text-primary-foreground shadow-soft">Aceptar</Button>
          </div>
        </div>
      )}

      {/* Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-lg font-medium text-foreground">Procesando...</p>
          </div>
        </div>
      )}
    </div>
  );
}