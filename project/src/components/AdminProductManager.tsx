import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useProducts } from "../hooks";
import { api } from "../lib/api";

interface Category {
  _id: string;
  name: string;
}

export function AdminProductManager() {
  const { user, signOut, isAdmin, error: authError } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [animeName, setAnimeName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [type, setType] = useState<"poster" | "sticker">("poster");
  const [dimensions, setDimensions] = useState("");
  const [materialQuality, setMaterialQuality] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);
  const { products, reloadProducts } = useProducts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await api.get<Category[]>("/categories");
        setCategories(categories);
        if (categories[0]) setCategory(categories[0]._id);
      } catch {
        setMessage("Could not load categories. Create categories from backend first.");
      }
    };
    loadCategories();
    window.addEventListener("categories-changed", loadCategories);
    return () => window.removeEventListener("categories-changed", loadCategories);
  }, []);

  const isValidCategory = /^[0-9a-fA-F]{24}$/.test(category);

  const canSubmit = useMemo(
    () =>
      title.trim().length >= 2 &&
      animeName.trim().length >= 2 &&
      isValidCategory &&
      description.trim().length >= 10 &&
      price &&
      Number(price) >= 0 &&
      stockQuantity &&
      Number(stockQuantity) >= 0 &&
      dimensions.trim().length >= 2 &&
      materialQuality.trim().length >= 2,
    [title, animeName, isValidCategory, description, price, stockQuantity, dimensions, materialQuality]
  );

  const getMissingFields = () => {
    const missing: string[] = [];
    if (title.trim().length < 2) missing.push("Title (min 2 chars)");
    if (animeName.trim().length < 2) missing.push("Anime Name");
    if (!isValidCategory) missing.push("Category (create one in Admin Categories first)");
    if (description.trim().length < 10) missing.push("Description (min 10 chars)");
    if (!price || Number(price) < 0) missing.push("Price");
    if (!stockQuantity || Number(stockQuantity) < 0) missing.push("Stock Quantity");
    if (dimensions.trim().length < 2) missing.push("Dimensions");
    if (materialQuality.trim().length < 2) missing.push("Material Quality");
    return missing;
  };
  const createProductReason = useMemo(() => {
    if (!user) return "Login required.";
    if (!isAdmin) return "Only admin can add products.";
    if (title.trim().length < 2) return "Title is required (min 2 characters).";
    if (animeName.trim().length < 2) return "Anime name is required.";
    if (!isValidCategory) return "Select a category (add categories in Admin Categories first).";
    if (description.trim().length < 10) return "Description must be at least 10 characters.";
    if (!price) return "Price is required.";
    if (!stockQuantity) return "Stock quantity is required.";
    if (dimensions.trim().length < 2) return "Dimensions are required.";
    if (materialQuality.trim().length < 2) return "Material quality is required.";
    if (loading) return "Please wait...";
    return "";
  }, [
    user,
    isAdmin,
    title,
    animeName,
    isValidCategory,
    description,
    price,
    stockQuantity,
    dimensions,
    materialQuality,
    loading,
  ]);

  const handleCreateProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      const missing = getMissingFields();
      setMessage(`Please fill required fields: ${missing.join(", ")}.`);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("animeName", animeName);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discountPrice", discountPrice || "0");
      formData.append("stockQuantity", stockQuantity);
      formData.append("type", type);
      formData.append("dimensions", dimensions);
      formData.append("materialQuality", materialQuality);
      formData.append("featured", String(featured));
      formData.append("trending", String(trending));

      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => formData.append("tags[]", tag));

      if (images) {
        Array.from(images).forEach((file) => formData.append("images", file));
      }

      await api.post("/products", formData);
      setMessage("Product created! Scroll up to the Shop section to see it.");
      window.dispatchEvent(new Event('product-created'));
      setTitle("");
      setAnimeName("");
      setDescription("");
      setPrice("");
      setDiscountPrice("");
      setStockQuantity("");
      setDimensions("");
      setMaterialQuality("");
      setTags("");
      setFeatured(false);
      setTrending(false);
      setImages(null);
      // reload admin product list
      reloadProducts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setMessage(null);
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted.");
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      reloadProducts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    setMessage(null);
    try {
      for (const id of selectedIds) {
        try {
          await api.delete(`/products/${id}`);
        } catch {
          // continue
        }
      }
      setMessage("Selected products deleted.");
      setSelectedIds([]);
      reloadProducts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete selected products");
    } finally {
      setDeleting(false);
    }
  }, [selectedIds, reloadProducts]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isAdmin) return;
      // Delete key triggers confirm bulk state
      if (e.key === "Delete") {
        if (selectedIds.length > 0) {
          setConfirmBulk(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, selectedIds.length]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="admin-products">
      <div className="max-w-4xl mx-auto bg-matte-black/70 border border-primary-red/30 rounded-xl p-6">
        <h2 className="text-3xl font-bold text-silver-white mb-4">Admin Product Manager</h2>
        <p className="text-silver-white/70 mb-6">Upload your own posters/stickers. Only admins can create products.</p>

        {!user && <p className="text-silver-white/80 mb-6">Login using the user icon in the navbar.</p>}

        {user && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-silver-white/80">
              Signed in as <span className="font-semibold">{user.email}</span> ({user.role})
            </p>
            <button onClick={() => signOut()} className="text-primary-red hover:underline">
              Logout
            </button>
          </div>
        )}

        {authError && <p className="text-primary-red mb-3">{authError}</p>}
        {message && <p className="text-silver-white/80 mb-4">{message}</p>}

        {user && !isAdmin && <p className="text-primary-red mb-4">You must be an admin to upload products.</p>}

        {user && isAdmin && (
          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="input" />
            <input value={animeName} onChange={(e) => setAnimeName(e.target.value)} placeholder="Anime Name *" className="input" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" required>
              {categories.length === 0 ? (
                <option value="">No categories — create one in Admin Categories first</option>
              ) : (
                categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description * (min 10 characters)"
              className="input md:col-span-2 min-h-24"
            />
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" placeholder="Price *" className="input" />
            <input
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              type="number"
              step="0.01"
              placeholder="Discount price"
              className="input"
            />
            <input value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} type="number" placeholder="Stock quantity *" className="input" />
            <select value={type} onChange={(e) => setType(e.target.value as "poster" | "sticker")} className="input">
              <option value="poster">Poster</option>
              <option value="sticker">Sticker</option>
            </select>
            <input value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="Dimensions *" className="input" />
            <input value={materialQuality} onChange={(e) => setMaterialQuality(e.target.value)} placeholder="Material quality *" className="input" />
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="input md:col-span-2" />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(e.target.files)}
              className="input md:col-span-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary-red file:px-3 file:py-2 file:text-white"
            />
            <label className="text-silver-white/80 flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured
            </label>
            <label className="text-silver-white/80 flex items-center gap-2">
              <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} />
              Trending
            </label>
            <button
              disabled={loading}
              type="submit"
              className="md:col-span-2 bg-primary-red text-white rounded-lg px-4 py-3 font-semibold disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Create Product"}
            </button>
            {(loading || !user || !isAdmin || !canSubmit) && (
              <p className="md:col-span-2 text-silver-white/60 text-sm">{createProductReason}</p>
            )}
          </form>
        )}

        {user && isAdmin && (
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-silver-white mb-2">Manage Products</h3>
            <p className="text-silver-white/70 mb-3 text-sm">Select products and click <span className="font-medium">Delete</span> to remove them.</p>
            {message && <p className="text-silver-white/80 mb-3 text-sm bg-matte-black/40 p-2 rounded border border-primary-red/10">{message}</p>}

            <div className="grid grid-cols-1 gap-3">
              {products.length === 0 ? (
                <p className="text-silver-white/70">No products found.</p>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-matte-black/60 p-3 rounded-md border border-primary-red/20">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                    <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <div className="text-silver-white font-medium">{p.title}</div>
                      <div className="text-silver-white/60 text-sm">{p.animeName} — {p.category}</div>
                    </div>
                    {confirmDeleteId === p.id ? (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => {
                            void handleDelete(p.id);
                            setConfirmDeleteId(null);
                          }}
                          disabled={deleting}
                          className="text-primary-red font-bold hover:underline"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deleting}
                          className="text-silver-white/60 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        disabled={deleting}
                        className="text-primary-red hover:underline ml-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              {confirmBulk ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      void handleBulkDelete();
                      setConfirmBulk(false);
                    }}
                    disabled={deleting}
                    className="bg-primary-red text-white rounded px-3 py-2 font-semibold"
                  >
                    Confirm Delete Selected ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => setConfirmBulk(false)}
                    disabled={deleting}
                    className="bg-matte-black/50 text-silver-white border border-primary-red/30 rounded px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmBulk(true)}
                  disabled={deleting || selectedIds.length === 0}
                  className="bg-primary-red text-white rounded px-3 py-2 disabled:opacity-60 font-semibold"
                >
                  {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedIds([]);
                  setConfirmBulk(false);
                  setConfirmDeleteId(null);
                  reloadProducts();
                }}
                className="text-silver-white/70 hover:underline"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
