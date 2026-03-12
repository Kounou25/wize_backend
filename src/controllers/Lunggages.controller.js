const pool = require("../config/db");



// CREATE (single or multiple bagages)
exports.createBagage = async (req, res) => {
  try {
    const { voyage_id, type_bagage, nombre, bagages } = req.body;

    let inserted = [];

    if (Array.isArray(bagages)) {
      // Cas multiple bagages
      for (const b of bagages) {
        const result = await pool.query(
          `INSERT INTO bagages (voyage_id, type_bagage, nombre)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [b.voyage_id || voyage_id, b.type, b.nombre]
        );
        inserted.push(result.rows[0]);
      }
    } else if (voyage_id && type_bagage && nombre != null) {
      // Cas unique bagage
      const result = await pool.query(
        `INSERT INTO bagages (voyage_id, type_bagage, nombre)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [voyage_id, type_bagage, nombre]
      );
      inserted.push(result.rows[0]);
    } else {
      return res.status(400).json({ error: "Données invalides" });
    }

    res.status(201).json(inserted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



// READ ALL
exports.getAllBagages = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT b.*, v.nomClient
      FROM bagages b
      JOIN voyages v ON v.id_voyage = b.voyage_id
      ORDER BY b.id_bagage DESC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// READ ONE
exports.getBagageById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM bagages WHERE id_bagage = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bagage non trouvé" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBagagesByVoyage = async (req, res) => {
  try {

    const { voyage_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM bagages 
       WHERE voyage_id = $1
       ORDER BY id_bagage DESC`,
      [voyage_id]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE
exports.updateBagage = async (req, res) => {

  try {

    const { id } = req.params;
    const { type_bagage, nombre } = req.body;

    const result = await pool.query(
      `UPDATE bagages
       SET type_bagage = $1,
           nombre = $2
       WHERE id_bagage = $3
       RETURNING *`,
      [type_bagage, nombre, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bagage non trouvé" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// DELETE
exports.deleteBagage = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM bagages WHERE id_bagage = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bagage non trouvé" });
    }

    res.json({ message: "Bagage supprimé" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};