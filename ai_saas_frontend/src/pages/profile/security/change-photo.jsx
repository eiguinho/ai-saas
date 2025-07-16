import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Layout from "../../../components/layout/Layout";
import { toast } from "react-toastify";
import { Image as ImageIcon, User as UserIcon, Trash2, ArrowLeft } from "lucide-react";
import styles from "../../profile/profile.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { userRoutes, profileRoutes } from "../../../services/apiRoutes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function EditPhotoPanel() {
  const { user, loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Extrai nome do arquivo para URL da foto
  const perfilPhoto = user?.perfil_photo;
  let perfilPhotoFilename = null;
  if (perfilPhoto && typeof perfilPhoto === "string") {
    perfilPhotoFilename = perfilPhoto.replace(/\\/g, "/").split("/").pop();
  }
  const perfilPhotoUrl = perfilPhotoFilename ? `${API_BASE_URL}/static/uploads/${perfilPhotoFilename}` : null;

  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (perfilPhotoUrl) {
      setPreviewUrl(perfilPhotoUrl);
    } else {
      setPreviewUrl("");
    }
  }, [photoFile, perfilPhotoUrl]);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("perfil_photo", photoFile);

      const res = await fetch(profileRoutes.updatePhoto(user.id), {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar foto");
      }

      toast.success("Foto atualizada com sucesso!");

      const updatedUser = await fetch(userRoutes.getCurrentUser(), { credentials: "include" }).then((res) => res.json());

      loginSuccess({ user: updatedUser });
      setPhotoFile(null);

      navigate("/profile/security");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Tem certeza que deseja remover sua foto de perfil?")) return;

    setLoading(true);
    try {
      const res = await fetch(profileRoutes.deletePhoto(user.id), {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao remover foto");
      }

      toast.success("Foto removida com sucesso!");

      const updatedUser = await fetch(userRoutes.getCurrentUser(), { credentials: "include" }).then((res) => res.json());

      loginSuccess({ user: updatedUser });
      setPhotoFile(null);

      navigate("/profile/security");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.returnLink}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                <nav className="flex items-center text-sm space-x-1">
                  <Link to="/profile" className="text-gray-700 hover:text-black">
                    Perfil
                  </Link>
                  <span>/</span>
                  <Link to="/profile/security" className="text-gray-700 hover:text-black">
                    Security
                  </Link>
                  <span>/</span>
                  <span className="text-gray-500">Editar Foto</span>
                </nav>
              </div>
      <section className="max-w-md mx-auto space-y-6">
        <h1 className={styles.title}>Atualizar Foto de Perfil</h1>

        <div className={`${styles.statCard} flex flex-col items-center space-y-6 relative`}>
          {/* Container da foto com botão remover no canto */}
          <div className="relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-md bg-gray-100 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Botão remover foto circular no canto superior direito */}
            {(previewUrl || photoFile) && (
              <button
                onClick={handleRemovePhoto}
                disabled={loading}
                title="Remover foto"
                className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition flex items-center justify-center"
                type="button"
                style={{ width: 28, height: 28 }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
            <p className={`${styles.statSubtext} mb-4`}>Selecione uma nova foto de perfil</p>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <ImageIcon className="w-4 h-4" />
              <input
                type="file"
                name="perfil_photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="ml-2"
              />
            </label>

            <button
              type="submit"
              disabled={!photoFile || loading}
              className={`w-full py-2 rounded-md text-white ${
                photoFile && !loading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
              } transition`}
            >
              {loading ? "Salvando..." : "Salvar Foto"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}