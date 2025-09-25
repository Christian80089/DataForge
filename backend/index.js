import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connessione MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connesso"))
.catch(err => console.log("Errore connessione MongoDB:", err));

// Funzione helper per ottenere un model dinamico
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

// GET dati collection
app.get("/api/data", async (req, res) => {
  try {
    const { collection } = req.query;
    if (!collection) return res.status(400).json({ error: "Collection mancante" });

    const Model = getModel(collection);
    const data = await Model.find().select("-__v").lean();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST nuovo documento
app.post("/api/data", async (req, res) => {
  try {
    const { collection, document } = req.body;
    if (!collection || !document) return res.status(400).json({ error: "Collection o documento mancante" });

    const Model = getModel(collection);
    const savedDoc = await new Model(document).save();
    res.json(savedDoc.toObject());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT aggiornamento documento
app.put("/api/data/:id", async (req, res) => {
  try {
    const { collection } = req.query;
    const { id } = req.params;
    if (!collection) return res.status(400).json({ error: "Collection mancante" });

    console.log("Aggiornamento documento:", id, req.body);

    const Model = getModel(collection);
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE documenti multipli
app.delete("/api/data", async (req, res) => {
  try {
    const { collection, ids } = req.body;
    if (!collection || !ids?.length) return res.status(400).json({ error: "Collection o IDs mancanti" });

    console.log("Eliminazione documenti:", ids);

    const Model = getModel(collection);
    await Model.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Documenti eliminati" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT aggiungi campo a tutti i documenti
app.put("/api/add-field-all", async (req, res) => {
  try {
    const { collection, key, value } = req.body;
    if (!collection || !key) return res.status(400).json({ error: "Collection o key mancante" });

    console.log(`Aggiunta campo globale: ${key} = ${value}`);

    const Model = getModel(collection);
    await Model.updateMany({}, { $set: { [key]: value || "" } });
    res.json({ message: "Campo aggiunto a tutti i documenti" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server in ascolto su http://localhost:${PORT}`));
