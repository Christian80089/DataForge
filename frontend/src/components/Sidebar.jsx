import { useState } from "react";
import DatabaseCard from "./DatabaseCard";

export default function Sidebar({ databases, onSelectCollection, selectedCollection, onDisconnect }) {
  const [selectedDb, setSelectedDb] = useState(null);

  return (
    <div className="w-64 bg-gray-100 h-full shadow-lg p-2 flex flex-col gap-2 overflow-y-auto">
      <h2 className="font-bold mb-2">Databases</h2>
      {databases.length === 0 && (
        <div className="text-gray-500 text-sm px-2">Nessun database disponibile</div>
      )}
      {databases.map((db) => (
        <DatabaseCard
          key={db.name}
          db={db}
          onSelectCollection={onSelectCollection}
          selectedCollection={selectedCollection}
          onDisconnect={onDisconnect}
          onConnect={(dbName) => setSelectedDb(dbName)}
        />
      ))}
    </div>
  );
}
