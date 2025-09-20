import DatabaseCard from "./DatabaseCard";

export default function Sidebar({ databases, onSelectCollection, selectedCollection, onDisconnect }) {
  return (
    <div className="w-64 bg-gray-100 h-full shadow-lg p-2 flex flex-col gap-2 overflow-y-auto">
      <h2 className="font-bold mb-2">Databases</h2>
      {databases.map(db => (
        <DatabaseCard
          key={db.name}
          db={db}
          onSelectCollection={onSelectCollection}
          selectedCollection={selectedCollection}
          onDisconnect={onDisconnect}
        />
      ))}
    </div>
  );
}
