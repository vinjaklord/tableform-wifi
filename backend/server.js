import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Data } from "./model.js";

const app = express();
const CONNECTION = `mongodb+srv://aaronpozzsarr:aaron12345@cluster0.kpi57.mongodb.net/`;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const data = await Data.find().select("date type text amount _id"); // Include _id
    res.json(data);
  } catch (error) {
    console.error("Error fetching API data | ", error.stack);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.post("/add", async (req, res) => {
  const data = req.body;
  try {
    const createdMember = new Data(data);
    const newMember = await createdMember.save();
    res.json(newMember);
  } catch (err) {
    console.error("Error saving data | ", err.stack);
    res.status(500).json({ error: "Failed to add data" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const deletedData = await Data.findByIdAndDelete(req.params.id);
    if (!deletedData) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.json({ message: "Data deleted successfully" });
  } catch (err) {
    console.error("Error deleting data | ", err.stack);
    res.status(500).json({ error: "Failed to delete data" });
  }
});

app.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log("Received ID:", id);
    console.log("Received updates:", updates);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const existingData = await Data.findById(id);
    if (!existingData) {
      return res.status(404).json({ error: "Data not found" });
    }

    const updatedData = await Data.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updatedData);
  } catch (err) {
    console.error("Error updating data | ", err.stack);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to update data", details: err.message });
  }
});

mongoose
  .connect(CONNECTION)
  .then(async () => {
    try {
      await Data.collection.dropIndex("email_1");
      console.log("Dropped email_1 index");
    } catch (err) {
      if (err.codeName === "IndexNotFound") {
        console.log("No email_1 index to drop");
      } else {
        console.error("Error dropping email_1 index:", err);
      }
    }

    try {
      await Data.collection.dropIndex("username_1");
      console.log("Dropped username_1 index");
    } catch (err) {
      if (err.codeName === "IndexNotFound") {
        console.log("No username_1 index to drop");
      } else {
        console.error("Error dropping username_1 index:", err);
      }
    }

    app.listen(8000, () => {
      console.log("http://localhost:8000");
    });
  })
  .catch((err) => {
    console.log("Error while connecting | ", err.stack);
  });
