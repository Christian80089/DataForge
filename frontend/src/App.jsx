import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import DataTable from "./components/DataTable";
import axios from "axios";

export default function App() {
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Recupera tutti i database e le collection
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/databases");
        // Normalizza: ogni database con le sue collection
        const dbList = res.data.map(db => ({
          name: db.name,
          collections: db.collections,
        }));
        setDatabases(dbList);
      } catch (err) {
        console.error("Errore recupero database:", err);
      }
    };

    fetchDatabases();
  }, []);

  const handleSelectCollection = (dbName, collectionName) => {
    setSelectedDb(dbName);
    setSelectedCollection(collectionName);
  };

  const handleDisconnect = () => {
    setSelectedDb(null);
    setSelectedCollection(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar
        databases={databases}
        onSelectCollection={handleSelectCollection}
        selectedCollection={selectedCollection}
        onDisconnect={handleDisconnect}
      />
      <div className="flex-1 p-4 overflow-hidden">
        {selectedCollection ? (
          <DataTable database={selectedDb} collection={selectedCollection} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Seleziona un database e una collection
          </div>
        )}
      </div>
    </div>
  );
}
