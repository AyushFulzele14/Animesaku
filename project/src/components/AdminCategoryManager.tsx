import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../hooks";

interface Category {
  _id: string;
  name: string;
}

export function AdminCategoryManager() {
  const { user, signOut, isAdmin, error: authError } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editCategoryName, setEditCategoryName] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await api.post("/categories", { name: trimmedName });
      setNewCategoryName("");
      await loadCategories();
      setMessage("Category created.");
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
      await api.patch(`/categories/${editCategoryId}`, { name: editCategoryName.trim() });
      setEditCategoryId("");
      setEditCategoryName("");
      await loadCategories();
      setMessage("Category updated.");
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

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-silver-white">Categories</h3>

          <div className="flex gap-3">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="input"
            />
            <button
              type="button"
              disabled={!canCreateCategory || loading || !isAdmin}
              className="bg-primary-red text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
              onClick={handleCreateCategory}
            >
              Add
            </button>
          </div>
          {(loading || !user || !isAdmin || !canCreateCategory) && (
            <p className="text-silver-white/60 text-sm">{createCategoryReason}</p>
          )}

          <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
            {categories.map((c) => (
              <div key={c._id} className="border border-primary-red/20 rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-silver-white font-semibold">{c.name}</p>
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
            <div className="border border-primary-red/20 rounded-lg p-3 space-y-3">
              <h4 className="font-semibold text-silver-white">Update category</h4>
              <input
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="input"
                placeholder="Category name"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!canUpdateCategory || loading || !isAdmin}
                  className="bg-primary-red text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                  onClick={handleUpdateCategory}
                >
                  Save
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="bg-black/50 text-silver-white border border-primary-red/30 rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                  onClick={() => {
                    setEditCategoryId("");
                    setEditCategoryName("");
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

