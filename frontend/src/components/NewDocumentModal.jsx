import { Plus, Save, X } from "lucide-react";

export default function NewDocumentModal({ newDocFields, setNewDocFields, onClose, onSave, onAddField }) {
  const handleNewDocChange = (index, field, value) => {
    setNewDocFields(prev =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white p-4 rounded-2xl w-full max-w-xl relative overflow-auto max-h-[90vh]">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 className="text-lg font-semibold mb-4">Nuovo documento</h3>

        {newDocFields.map((f, index) => (
          <div key={index} className="flex gap-2 mb-2 flex-wrap">
            <input
              className="flex-1 min-w-[100px] p-2 border rounded"
              placeholder="Campo"
              value={f.key}
              onChange={e => handleNewDocChange(index, "key", e.target.value)}
              disabled={!!f.key}
            />
            <input
              className="flex-1 min-w-[100px] p-2 border rounded"
              placeholder="Valore"
              value={f.value}
              onChange={e => handleNewDocChange(index, "value", e.target.value)}
            />
          </div>
        ))}

        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 flex-shrink-0"
            onClick={onAddField}
          >
            <Plus size={14} /> Campo
          </button>

          <button
            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex-shrink-0"
            onClick={e => {
              e.preventDefault();
              if (newDocFields.every(f => !f.key)) {
                alert("Devi inserire almeno un campo!");
                return;
              }
              onSave();
            }}
          >
            <Save size={14} /> Salva
          </button>

          <button
            className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex-shrink-0"
            onClick={onClose}
          >
            <X size={14} /> Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
