const express = require("express");
const router = express.Router();
const { Arsip } = require("../models");
const { authenticate } = require("../middleware/auth");

// Route to create a new arsip
router.post("/", authenticate, async (req, res) => {
  try {
    const { arsipName, categoryID, description } = req.body;
    const arsip = await Arsip.create({ arsipName, categoryID, description });
    res.status(201).json(arsip);
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message: "Foreign key constraint error: Category ID not found",
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

const { Op } = require("sequelize");

router.get("/", authenticate, async (req, res) => {
  let { page = 1, limit = 10 } = req.query; // Default page 1 and limit 10 per page

  // Validate and parse limit to ensure it's a number
  limit = parseInt(limit, 10);

  try {
    const offset = (page - 1) * limit;

    const { count, rows: arsips } = await Arsip.findAndCountAll({
      offset,
      limit,
    });

    if (arsips.length === 0) {
      return res.status(404).json({ message: "Arsips not found" });
    }

    const totalPages = Math.ceil(count / limit);

    const response = {
      totalCount: count,
      totalPages,
      currentPage: page,
      arsips,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching arsips:", error);
    res.status(500).json({ message: "Failed to fetch arsips" });
  }
});

// Route to get an arsip by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const arsip = await Arsip.findByPk(id);
    if (!arsip) throw new Error("Arsip not found");
    res.json(arsip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update an arsip by ID
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { arsipName, categoryID, description } = req.body;
    const arsip = await Arsip.findByPk(id);
    if (!arsip) throw new Error("Arsip not found");
    arsip.arsipName = arsipName;
    arsip.categoryID = categoryID;
    arsip.description = description;
    await arsip.save();
    res.json(arsip);
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message: "Foreign key constraint error: Category ID not found",
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Route to delete an arsip by ID
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const arsip = await Arsip.findByPk(id);
    if (!arsip) throw new Error("Arsip not found");
    await arsip.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
