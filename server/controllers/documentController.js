const express = require("express");
const db = require("../config/db");
const router = express.Router();
const documentService = require("../services/documentService");

// Document Operations Logic
router.get("/", async (req, res) => {
  try {
    const nodes = await documentService.getAllNodesData();
    res.json(nodes);
  } catch (error) {
    console.error("Error retrieving document structure:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/addNode", async (req, res) => {
  try {
    const { parentId, content } = req.body;

    const nodeId = await documentService.addNode(parentId, content);

    res
      .status(201)
      .json({ message: "Node added successfully", nodeId: nodeId });
  } catch (error) {
    console.error("Error adding node:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/editNode/:id", async (req, res) => {
  try {
    const nodeId = req.params.id;
    const { content } = req.body;

    await documentService.editNode(nodeId, content);

    res.json({ message: "Node edited successfully" });
  } catch (error) {
    console.error("Error editing node:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/deleteNode/:id", async (req, res) => {
  try {
    const nodeId = req.params.id;

    await documentService.deleteNode(nodeId);

    res.json({ message: "Node deleted successfully" });
  } catch (error) {
    console.error("Error deleting node:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
