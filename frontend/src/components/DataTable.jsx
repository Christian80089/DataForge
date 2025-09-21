import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Plus, Save, X } from "lucide-react";

export default function Table({ collection }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("Tutte");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [newDocFields, setNewDocFields] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [globalFieldKey, setGlobalFieldKey] = useState("");
  const [globalFieldValue, setGlobalFieldValue] = useState("");

  // 🔹 Fetch dati dal backend
  const fetchData = async () => {
    if (!collection) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/data?collection=${collection}`
      );
      const cleaned = (res.data || []).map(doc => {
        const { _id, primary_key, script_date_time, ...rest } = doc;
        return rest;
      });
      setData(cleaned);
      setEditedData({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [collection]);

  // 🔹 Gestione edit inline
  const handleCellChange = (rowIndex, key, value) => {
    setEditedData(prev => {
      const updated = { ...prev };
      if (!updated[rowIndex]) updated[rowIndex] = { ...data[rowIndex] };
      updated[rowIndex][key] = value;
      return updated;
    });
    setData(prev =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, [key]: value } : row
      )
    );
  };

  // 🔹 Salvataggio modifiche globali
  const saveAllEdits = async () => {
    const updates = Object.values(editedData);
    if (updates.length === 0) return;
    try {
      await axios.put(`http://localhost:5000/api/data/bulk`, {
        collection,
        documents: updates,
      });
      setEditedData({});
      fetchData();
    } catch (err) {
      console.error("Errore salvataggio bulk:", err);
    }
  };

  // 🔹 Aggiunta nuovo documento
  const openNewDocForm = () => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      setNewDocFields(keys.map(k => ({ key: k, value: "" })));
    } else {
      setNewDocFields([{ key: "", value: "" }]);
    }
    setShowNewDocForm(true);
  };

  const handleNewDocChange = (index, field, value) => {
    setNewDocFields(prev =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const addNewDocField = () => {
    setNewDocFields(prev => [...prev, { key: "", value: "" }]);
  };

  const saveNewDoc = async () => {
    const doc = {};
    newDocFields.forEach(f => {
      if (f.key) doc[f.key] = f.value;
    });
    if (Object.keys(doc).length === 0) return;

    try {
      await axios.post(`http://localhost:5000/api/data`, {
        collection,
        document: doc,
      });
      setShowNewDocForm(false);
      setNewDocFields([]);
      fetchData();
    } catch (err) {
      console.error("Errore aggiunta documento:", err);
    }
  };

  // 🔹 Aggiungi campo globale
  const addFieldToAllDocs = async () => {
    if (!globalFieldKey) return;
    try {
      await axios.put(`http://localhost:5000/api/add-field-all`, {
        collection,
        key: globalFieldKey,
        value: globalFieldValue,
      });
      setShowAddFieldForm(false);
      setGlobalFieldKey("");
      setGlobalFieldValue("");
      fetchData();
    } catch (err) {
      console.error("Errore aggiunta campo globale:", err);
    }
  };

  // 🔹 Definizione colonne
  const columns = data[0]
    ? Object.keys(data[0]).map(key => ({
        name: key,
        selector: (row, rowIndex) => (
          <input
            className="border rounded px-1 w-full"
            value={row[key] || ""}
            onChange={e => handleCellChange(rowIndex, key, e.target.value)}
          />
        ),
        sortable: true,
        wrap: true,
      }))
    : [];

  const filteredData = data.filter(d => {
    if (!search) return true;
    if (searchColumn === "Tutte") {
      return Object.values(d).some(v =>
        String(v).toLowerCase().includes(search.toLowerCase())
      );
    } else {
      const value = d[searchColumn];
      return value && String(value).toLowerCase().includes(search.toLowerCase());
    }
  });

  return (
    <div className="h-full w-full p-4 shadow-2xl rounded-2xl bg-white overflow-auto">
      {/* 🔹 Ricerca e controlli */}
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Cerca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={searchColumn}
          onChange={e => setSearchColumn(e.target.value)}
        >
          <option value="Tutte">Tutte le colonne</option>
          {columns.map(col => (
            <option key={col.name} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>

        <button
          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={openNewDocForm}
        >
          <Plus size={16} /> Aggiungi documento
        </button>

        <button
          className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => setShowAddFieldForm(prev => !prev)}
        >
          <Plus size={16} /> Aggiungi campo globale
        </button>

        <button
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={saveAllEdits}
        >
          <Save size={16} /> Salva modifiche
        </button>
      </div>

      {/* 🔹 Modal nuovo documento */}
      {showNewDocForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowNewDocForm(false)}
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Nuovo documento</h3>
            {newDocFields.map((f, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  className="flex-1 p-2 border rounded"
                  placeholder="Campo"
                  value={f.key}
                  onChange={e => handleNewDocChange(index, "key", e.target.value)}
                  disabled={!!f.key}
                />
                <input
                  className="flex-1 p-2 border rounded"
                  placeholder="Valore"
                  value={f.value}
                  onChange={e =>
                    handleNewDocChange(index, "value", e.target.value)
                  }
                />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={addNewDocField}
              >
                <Plus size={16} /> Campo
              </button>
              <button
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={saveNewDoc}
              >
                <Save size={16} /> Salva documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Form aggiunta campo globale */}
      {showAddFieldForm && (
        <div className="border p-3 mb-4 rounded bg-yellow-50">
          <h3 className="font-semibold mb-2">Aggiungi campo a tutti i documenti</h3>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 p-2 border rounded"
              placeholder="Nome campo"
              value={globalFieldKey}
              onChange={e => setGlobalFieldKey(e.target.value)}
            />
            <input
              className="flex-1 p-2 border rounded"
              placeholder="Valore (opzionale)"
              value={globalFieldValue}
              onChange={e => setGlobalFieldValue(e.target.value)}
            />
          </div>
          <button
            className="px-3 py-1 bg-purple-500 text-white rounded"
            onClick={addFieldToAllDocs}
          >
            <Plus size={16} /> Aggiungi a tutti
          </button>
        </div>
      )}

      {/* 🔹 Tabella */}
      <DataTable
        columns={columns}
        data={filteredData}
        selectableRows
        onSelectedRowsChange={state => setSelectedRows(state.selectedRows)}
        progressPending={loading}
        pagination
        paginationPerPage={15}
        paginationRowsPerPageOptions={[15, 30, 50, 100]}
        highlightOnHover
        responsive
        striped
        dense
      />
    </div>
  );
}
