const pool = require('../config/db');

// GET /agences — liste toutes les agences
const getAllAgences = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agences ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /agences/:id — une agence par id
const getAgenceById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM agences WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /agences — créer une agence
const createAgence = async (req, res) => {
  const { agence, ville, pays } = req.body;

  if (!agence || !ville || !pays) {
    return res.status(400).json({ error: 'agence, ville et pays sont requis' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO agences (agence, ville, pays)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [agence, ville, pays]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /agences/:id — mettre à jour une agence
const updateAgence = async (req, res) => {
  const { id } = req.params;
  const { agence, ville, pays } = req.body;

  if (!agence || !ville || !pays) {
    return res.status(400).json({ error: 'agence, ville et pays sont requis' });
  }

  try {
    const result = await pool.query(
      `UPDATE agences
       SET agence = $1, ville = $2, pays = $3
       WHERE id = $4
       RETURNING *`,
      [agence, ville, pays, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /agences/:id — supprimer une agence
const deleteAgence = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM agences WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }
    res.json({ message: 'Agence supprimée', agence: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllAgences, getAgenceById, createAgence, updateAgence, deleteAgence };
