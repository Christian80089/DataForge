import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";

export default function Table({ database, collection }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("Tutte"); // colonna selezionata

  const fetchData = async () => {
    if (!collection) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/data?collection=${collection}`);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [collection]);

  const columns = data[0]
    ? Object.keys(data[0]).map(key => ({
        name: key,
        selector: row => row[key],
        sortable: true,
        wrap: true,
      }))
    : [];

  // dati filtrati in base a ricerca e colonna selezionata
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
    <div className="h-full w-full p-2 shadow-2xl rounded-2xl bg-white overflow-auto">
      <div className="flex gap-2 mb-2">
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
            <option key={col.name} value={col.name}>{col.name}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
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
