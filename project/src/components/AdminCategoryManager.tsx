import { useEffect, useMemo, useState } from "react";
import { api, resolveAssetUrl } from "../lib/api";
import { useAuth } from "../hooks";

interface Category {
  _id: string;
  name: string;
  image?: {
    public_id?: string;
    url?: string;
  };
}

export function AdminCategoryManager() {
  const { user, signOut, isAdmin, error: authError } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);

  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canCreateCategory = useMemo(() => newCategoryName.trim().length > 1, [newCategoryName]);
  const canUpdateCategory = useMemo(
    () => editCategoryId && editCategoryName.trim().length > 1,
    [editCategoryId, editCategoryName]
  );
  const createCategoryReason = useMemo(() => {
    if (!user) return "Login required.";
    if (!isAdmin) return "Only admin can add categories.";
    if (!newCategoryName.trim()) return "Enter category name.";
    if (newCategoryName.trim().length < 2) return "Category name must be at least 2 characters.";
    if (loading) return "Please wait...";
    return "";
  }, [user, isAdmin, newCategoryName, loading]);

  const updateCategoryReason = useMemo(() => {
    if (!user) return "Login required.";
    if (!isAdmin) return "Only admin can update categories.";
    if (!editCategoryId) return "Select a category to edit.";
    if (!editCategoryName.trim()) return "Enter updated category name.";
    if (editCategoryName.trim().length < 2) return "Category name must be at least 2 characters.";
    if (loading) return "Please wait...";
    return "";
  }, [user, isAdmin, editCategoryId, editCategoryName, loading]);

  const loadCategories = async () => {
    const categories = await api.get<Category[]>("/categories");
    setCategories(categories);
  };

  useEffect(() => {
    loadCategories().catch(() => setMessage("Failed to load categories."));
  }, []);

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!isAdmin) {
      setMessage("Only admin can add categories.");
      return;
    }
    if (trimmedName.length < 2) {
      setMessage("Category name must be at least 2 characters.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      if (newCategoryImage) {
        formData.append("image", newCategoryImage);
      }

      await api.post("/categories", formData);
      setNewCategoryName("");
      setNewCategoryImage(null);
      
      // Clear file inputs on document if any
      const fileInput = document.getElementById("new-category-img-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await loadCategories();
      setMessage("Category created successfully.");
      window.dispatchEvent(new Event("categories-changed"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", editCategoryName.trim());
      if (editCategoryImage) {
        formData.append("image", editCategoryImage);
      }

      await api.patch(`/categories/${editCategoryId}`, formData);
      setEditCategoryId("");
      setEditCategoryName("");
      setEditCategoryImage(null);

      // Clear file inputs on document if any
      const fileInput = document.getElementById("edit-category-img-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await loadCategories();
      setMessage("Category updated successfully.");
      window.dispatchEvent(new Event("categories-changed"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAdmin) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.delete(`/categories/${id}`);
      await loadCategories();
      setMessage("Category deleted.");
      window.dispatchEvent(new Event("categories-changed"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="admin">
      <div className="max-w-4xl mx-auto bg-matte-black/70 border border-primary-red/30 rounded-xl p-6">
        <h2 className="text-3xl font-bold text-silver-white mb-2">Admin Categories</h2>
        <p className="text-silver-white/70 mb-6">Create main categories for your posters and stickers.</p>

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

        {!user && <p className="text-silver-white/80 mb-4">Login first using the user icon in the navbar.</p>}
        {user && !isAdmin && <p className="text-primary-red mb-4">You must be an admin to manage categories.</p>}
        {authError && <p className="text-primary-red mb-3">{authError}</p>}
        {message && <p className="text-silver-white/80 mb-4">{message}</p>}

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-silver-white">Categories</h3>

          <div className="border border-primary-red/20 rounded-xl p-4 bg-black/40 space-y-4">
            <h4 className="font-semibold text-silver-white">Create New Category</h4>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="input flex-1"
              />
              <button
                type="button"
                disabled={!canCreateCategory || loading || !isAdmin}
                className="bg-primary-red text-white rounded-lg px-6 py-2 font-semibold disabled:opacity-60 shrink-0"
                onClick={handleCreateCategory}
              >
                Add Category
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-silver-white/60 font-semibold uppercase tracking-wider">
                Category Background Image (Optional)
              </label>
              <input
                id="new-category-img-input"
                type="file"
                accept="image/*"
                onChange={(e) => setNewCategoryImage(e.target.files?.[0] || null)}
                className="text-xs text-silver-white/80 file:bg-primary-red/10 file:text-primary-red file:border-0 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:font-semibold hover:file:bg-primary-red/20 file:cursor-pointer"
              />
            </div>
            {(loading || !user || !isAdmin || !canCreateCategory) && (
              <p className="text-silver-white/60 text-sm">{createCategoryReason}</p>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {categories.map((c) => (
              <div key={c._id} className="border border-primary-red/20 rounded-lg p-3 bg-black/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {c.image?.url && (
                      <img
                        src={resolveAssetUrl(c.image.url)}
                        alt={c.name}
                        className="w-12 h-12 object-cover rounded-lg border border-primary-red/20"
                      />
                    )}
                    <p className="text-silver-white font-semibold">{c.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-primary-red hover:underline"
                      onClick={() => {
                        setEditCategoryId(c._id);
                        setEditCategoryName(c.name);
                      }}
                    >
                      Edit
                    </button>
                    {confirmDeleteId === c._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-primary-red font-bold hover:underline"
                          onClick={() => {
                            void handleDeleteCategory(c._id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="text-silver-white/60 hover:underline"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-primary-red hover:underline"
                        onClick={() => setConfirmDeleteId(c._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-silver-white/60">No categories yet.</p>}
          </div>

          {editCategoryId && (
            <div className="border border-primary-red/20 rounded-lg p-4 bg-black/40 space-y-4">
              <h4 className="font-semibold text-silver-white">Update Category Details</h4>
              <input
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="input"
                placeholder="Category name"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-silver-white/60 font-semibold uppercase tracking-wider">
                  Update Background Image (Optional)
                </label>
                <input
                  id="edit-category-img-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCategoryImage(e.target.files?.[0] || null)}
                  className="text-xs text-silver-white/80 file:bg-primary-red/10 file:text-primary-red file:border-0 file:rounded-md file:px-3 file:py-1.5 file:mr-3 file:font-semibold hover:file:bg-primary-red/20 file:cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!canUpdateCategory || loading || !isAdmin}
                  className="bg-primary-red text-white rounded-lg px-6 py-2 font-semibold disabled:opacity-60"
                  onClick={handleUpdateCategory}
                >
                  Save
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="bg-black/50 text-silver-white border border-primary-red/30 rounded-lg px-6 py-2 font-semibold disabled:opacity-60"
                  onClick={() => {
                    setEditCategoryId("");
                    setEditCategoryName("");
                    setEditCategoryImage(null);
                  }}
                >
                  Cancel
                </button>
              </div>
              {(loading || !user || !isAdmin || !canUpdateCategory) && (
                <p className="text-silver-white/60 text-sm">{updateCategoryReason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
