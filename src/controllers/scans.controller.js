const pool = require('../config/db');

//  GET ALL
exports.getAllScans = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        scans.*,
        cards.card_id,
        users.full_name AS scanned_by_name
      FROM scans
      LEFT JOIN cards ON cards.id = scans.scanned_card
      LEFT JOIN users ON users.id = scans.scanned_by
      ORDER BY scans.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//  GET BY ID
exports.getScanById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM scans WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scan non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.createScan = async (req, res) => {
  const { scanned_card } = req.body;

  const scanned_by = req.user.id; 

  try {
    const cardCheck = await pool.query(
      `SELECT * FROM cards WHERE id = $1`,
      [scanned_card]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ error: "Carte invalide" });
    }

    // 🚀 Enregistrer le scan
    const result = await pool.query(
      `INSERT INTO scans (scanned_card, scanned_by)
       VALUES ($1, $2)
       RETURNING *`,
      [scanned_card, scanned_by]
    );

    res.status(201).json({
      message: "Scan enregistré",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//  DELETE
exports.deleteScan = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM scans WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scan non trouvé" });
    }

    res.json({ message: "Scan supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};