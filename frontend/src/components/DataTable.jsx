import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Plus, Save, X, RotateCcw } from "lucide-react";
import api from "../services/api";
import NewDocumentModal from "./NewDocumentModal";

export default function Table({ collection }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("Tutte");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [newDocFields, setNewDocFields] = useState([]);
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [globalFieldKey, setGlobalFieldKey] = useState("");
  const [globalFieldValue, setGlobalFieldValue] = useState("");
  const [expandedDoc, setExpandedDoc] = useState(null);

  const fetchData = async () => {
    if (!collection) return;
    setLoading(true);
    try {
      const res = await api.get(`/data?collection=${collection}`);
      const cleaned = (res.data || []).map(doc => {
        const { primary_key, script_date_time, ...rest } = doc;
        return { ...rest, _id: doc._id };
      });
      setData(cleaned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [collection]);

  // Aggiorna documento
  const saveDoc = async () => {
    if (!expandedDoc?._id) return;
    const { _id, ...docToSave } = expandedDoc;
    try {
      await api.put(`/data/${_id}?collection=${collection}`, docToSave);
      setExpandedDoc(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Nuovo documento
  const openNewDocForm = () => {
    if (data.length > 0) {
      const keys = Object.keys(data[0]).filter(k => !["_id", "primary_key", "script_date_time"].includes(k));
      setNewDocFields(keys.map(k => ({ key: k, value: "" })));
    } else {
      setNewDocFields([{ key: "", value: "" }]);
    }
    setShowNewDocForm(true);
  };

  const addNewDocField = () => setNewDocFields(prev => [...prev, { key: "", value: "" }]);

  const saveNewDoc = async () => {
    const doc = {};
    newDocFields.forEach(f => { if (f.key) doc[f.key] = f.value; });
    if (!Object.keys(doc).length) return;
    try {
      await api.post(`/data`, { collection, document: doc });
      setShowNewDocForm(false);
      setNewDocFields([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Aggiungi campo globale
  const addFieldToAllDocs = async () => {
    if (!globalFieldKey) return;
    try {
      await api.put(`/add-field-all`, {
        collection,
        key: globalFieldKey,
        value: globalFieldValue || ""
      });
      setShowAddFieldForm(false);
      setGlobalFieldKey("");
      setGlobalFieldValue("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Elimina documenti selezionati
  const deleteSelectedDocs = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Vuoi eliminare ${selectedRows.length} documento/i selezionato/i?`)) return;
    try {
      const idsToDelete = selectedRows.map(row => row._id);
      await api.delete(`/data`, { data: { collection, ids: idsToDelete } });
      setSelectedRows([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Colonne della tabella
  const columns = data[0]
    ? Object.keys(data[0])
        .filter(key => !["_id", "primary_key", "script_date_time"].includes(key))
        .map(key => ({ name: key, selector: row => row[key] || "", sortable: true, wrap: true }))
    : [];

  const filteredData = data.filter(d => {
    if (!search) return true;
    if (searchColumn === "Tutte") return Object.values(d).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    return d[searchColumn] && String(d[searchColumn]).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-full w-full p-4 shadow-2xl rounded-2xl bg-white overflow-auto">
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input className="flex-1 p-2 border rounded" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="p-2 border rounded" value={searchColumn} onChange={e => setSearchColumn(e.target.value)}>
          <option value="Tutte">Tutte le colonne</option>
          {columns.map(col => <option key={col.name} value={col.name}>{col.name}</option>)}
        </select>

        <button className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex-shrink-0" onClick={openNewDocForm}>
          <Plus size={14} /> Nuovo
        </button>

        <button className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex-shrink-0" onClick={() => setShowAddFieldForm(prev => !prev)}>
          <Plus size={14} /> Campo
        </button>

        <button className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex-shrink-0" onClick={deleteSelectedDocs} disabled={!selectedRows.length}>
          <X size={14} /> Elimina
        </button>
      </div>

      {showNewDocForm && <NewDocumentModal newDocFields={newDocFields} setNewDocFields={setNewDocFields} onClose={() => setShowNewDocForm(false)} onSave={saveNewDoc} onAddField={addNewDocField} />}

      {showAddFieldForm && (
        <div className="border p-3 mb-4 rounded bg-yellow-50">
          <h3 className="font-semibold mb-2">Aggiungi campo a tutti i documenti</h3>
          <div className="flex gap-2 mb-2 flex-wrap">
            <input className="flex-1 min-w-[100px] p-2 border rounded" placeholder="Nome campo" value={globalFieldKey} onChange={e => setGlobalFieldKey(e.target.value)} />
            <input className="flex-1 min-w-[100px] p-2 border rounded" placeholder="Valore (opzionale)" value={globalFieldValue} onChange={e => setGlobalFieldValue(e.target.value)} />
          </div>
          <button className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex-shrink-0" onClick={addFieldToAllDocs}>
            <Plus size={14} /> Aggiungi
          </button>
        </div>
      )}

      {expandedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-4 rounded-2xl w-full max-w-2xl relative overflow-auto max-h-[90vh]">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={() => setExpandedDoc(null)}>
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Modifica documento</h3>
            {Object.keys(expandedDoc).map((key, index) => {
              if (["_id", "primary_key", "script_date_time"].includes(key)) return null;
              const value = expandedDoc[key];
              return (
                <div key={index} className="flex flex-col gap-1 mb-4">
                  <label className="font-semibold">{key}</label>
                  {String(value).length > 50 ? (
                    <textarea className="w-full p-2 border rounded resize-none" rows={Math.max(3, Math.ceil(String(value).length / 50))} value={value} onChange={e => setExpandedDoc(prev => ({ ...prev, [key]: e.target.value }))} />
                  ) : (
                    <input className="w-full p-2 border rounded" value={value} onChange={e => setExpandedDoc(prev => ({ ...prev, [key]: e.target.value }))} />
                  )}
                </div>
              );
            })}
            <div className="flex justify-end gap-2 mt-4 flex-wrap">
              <button className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => setExpandedDoc(null)}>
                <RotateCcw size={16} /> Annulla
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={saveDoc}>
                <Save size={16} /> Salva
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredData}
        selectableRows
        onSelectedRowsChange={state => setSelectedRows(state.selectedRows)}
        onRowClicked={row => setExpandedDoc(row)}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
        striped
        dense
      />
    </div>
  );
}
