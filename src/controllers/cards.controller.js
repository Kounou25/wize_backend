const pool = require("../config/db");

//  Créer une carte
exports.createCard = async (req, res) => {
  const { card_id, created_by } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cards (card_id, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [card_id, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Card déjà existante" });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
};

//  Récupérer toutes les cartes
exports.getAllCards = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cards.*, users.full_name 
      FROM cards
      LEFT JOIN users ON users.id = cards.created_by
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

//  Récupérer une carte par ID
exports.getCardById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM cards WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Carte non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer une carte
exports.deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM cards WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Carte non trouvée" });
    }

    res.json({ message: "Carte supprimée" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};