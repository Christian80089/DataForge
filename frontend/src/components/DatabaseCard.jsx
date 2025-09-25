import { useState } from "react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";

export default function DatabaseCard({ db, onSelectCollection, selectedCollection, onDisconnect, onConnect }) {
  const [isConnected, setIsConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleConnect = () => {
    setIsConnected(true);
    onConnect(db.name); // Notifica il parent che ci siamo connessi a questo DB
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setMenuOpen(false);
    onDisconnect();
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const handleSelect = (col) => onSelectCollection(db.name, col);

  return (
    <div className="bg-white rounded-xl shadow-md p-3 transition flex flex-col">
      {/* Intestazione DB */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full block ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <div>
            <div className="font-semibold">{db.name}</div>
            <div className="text-sm text-gray-500">
              {selectedCollection
                ? `${db.type || "Mongo Atlas"} - ${selectedCollection}`
                : db.type || "Mongo Atlas"}
            </div>
          </div>
        </div>

        {/* Pulsanti */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-800">
                {menuOpen ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              >
                Disconnetti
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
            >
              Connetti
            </button>
          )}
        </div>
      </div>

      {/* Menu collection */}
      {isConnected && menuOpen && db.collections?.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {db.collections.map((col) => (
            <button
              key={col}
              className={`text-sm text-gray-700 px-2 py-1 rounded text-left hover:bg-purple-200 ${
                selectedCollection === col ? "bg-purple-300 font-semibold" : ""
              }`}
              onClick={() => handleSelect(col)}
            >
              {col}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
