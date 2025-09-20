import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connetti a Mongo Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connesso"))
.catch(err => console.log("Errore connessione MongoDB:", err));

// Funzione per ottenere un modello generico per qualsiasi collection
const getModel = (collectionName) => {
  const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
  return mongoose.models[collectionName] || mongoose.model(collectionName, schema);
};
// 🔹 GET tutti i database e le collection
app.get("/api/databases", async (req, res) => {
  try {
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();

    const result = [];

    for (let dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      if (dbName === "admin" || dbName === "local" || dbName === "config") continue; // filtra i sistemi interni

      // Connettiti temporaneamente a quel database
      const db = mongoose.connection.client.db(dbName);
      const collections = await db.listCollections().toArray();
      result.push({
        name: dbName,
        type: "Mongo Atlas",
        collections: collections.map(c => c.name),
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 GET dati collection
app.get("/api/data", async (req, res) => {
  try {
    const { collection } = req.query;
    if (!collection) return res.status(400).json({ error: "Collection mancante" });

    const Model = getModel(collection);
    const data = await Model.find().lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT aggiornamento documento
app.put("/api/data/:id", async (req, res) => {
  try {
    const { collection } = req.query;
    const { id } = req.params;
    const update = req.body;

    if (!collection) return res.status(400).json({ error: "Collection mancante" });

    const Model = getModel(collection);
    await Model.findByIdAndUpdate(id, update);
    res.json({ message: "Documento aggiornato" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE documento
app.delete("/api/data/:id", async (req, res) => {
  try {
    const { collection } = req.query;
    const { id } = req.params;

    if (!collection) return res.status(400).json({ error: "Collection mancante" });

    const Model = getModel(collection);
    await Model.findByIdAndDelete(id);
    res.json({ message: "Documento eliminato" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server in ascolto su http://localhost:${PORT}`));
