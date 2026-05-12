import { useEffect, useState } from "react";
import api from "../../lib/axios";

export default function BusinessDocumentsPage() {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [form, setForm] = useState({
    project_id: "",
    title: "",
    document_type: "legal",
  });

  const [file, setFile] = useState(null);

  const fetchData = async () => {
    try {
      const [projectRes, docRes] = await Promise.all([
  api.get("/projects/my"),
  api.get("/documents"),
]);

      setProjects(projectRes.data.projects || []);
      setDocuments(docRes.data.documents || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("project_id", form.project_id);
      data.append("title", form.title);
      data.append("document_type", form.document_type);
      data.append("file", file);

      await api.post("/documents/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload thành công");

      setForm({
        project_id: "",
        title: "",
        document_type: "legal",
      });

      setFile(null);

      fetchData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Upload thất bại"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa tài liệu?")) return;

    try {
      await api.delete(`/documents/${id}`);

      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Quản lý tài liệu dự án
      </h1>

      <form
        onSubmit={handleUpload}
        className="bg-[#10182B] p-6 rounded-2xl mb-8 space-y-4"
      >
        <select
          value={form.project_id}
          onChange={(e) =>
            setForm({
              ...form,
              project_id: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-[#0B1120]"
        >
          <option value="">Chọn dự án</option>

          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tên tài liệu"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-[#0B1120]"
        />

        <select
          value={form.document_type}
          onChange={(e) =>
            setForm({
              ...form,
              document_type: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-[#0B1120]"
        >
          <option value="legal">
            Pháp lý
          </option>

          <option value="financial">
            Tài chính
          </option>

          <option value="esg">
            ESG
          </option>

          <option value="pitchdeck">
            Pitch Deck
          </option>
        </select>

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="w-full"
        />

        <button
          type="submit"
          className="bg-green-500 px-6 py-3 rounded-xl font-bold"
        >
          Upload tài liệu
        </button>
      </form>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="bg-[#10182B] p-5 rounded-2xl flex items-center justify-between"
          >
            <div>
              <h2 className="font-bold text-lg">
                {doc.title}
              </h2>

              <p className="text-white/60">
                {doc.project_id?.title}
              </p>

              <p className="text-green-400 text-sm">
                {doc.document_type}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={`http://localhost:5001${doc.file_url}`}
                target="_blank"
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                Xem
              </a>

              <button
                onClick={() =>
                  handleDelete(doc._id)
                }
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}