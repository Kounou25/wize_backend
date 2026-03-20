const pool = require('../config/db');

// GET /voyages — liste tous les voyages
const getAllVoyages = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM voyages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /voyages/:id — un voyage par id
const getVoyageById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM voyages WHERE id_voyage = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// GET /voyages/:tel — un voyage par numero
const getVoyageByTel = async (req, res) => {
  const { tel } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM voyages WHERE phone = $1',
      [tel]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage not found' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// POST /voyages — créer un voyage
const createVoyage = async (req, res) => {
  const {
    nomClient,
    phone,
    ville_dep,
    ville_arr,
    date_dep,
    nbr_place,
    total_price,
    status,
  } = req.body;

  if (!phone || !ville_dep || !ville_arr || !nbr_place) {
    return res.status(400).json({
      error: 'phone, ville_dep, ville_arr and nbr_place are required',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO voyages (nomClient, phone, ville_dep, ville_arr, date_dep, nbr_place, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nomClient, phone, ville_dep, ville_arr, date_dep, nbr_place, total_price, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /voyages/:id — mettre à jour un voyage
const updateVoyage = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = [];
  const values = [];
  let i = 1;

  for (const key in updates) {
    fields.push(`${key} = $${i}`);
    values.push(updates[key]);
    i++;
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "Aucun champ à mettre à jour" });
  }

  try {
    const result = await pool.query(
      `UPDATE voyages SET ${fields.join(", ")} WHERE id_voyage = $${i} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Voyage not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// DELETE /voyages/:id — supprimer un voyage
const deleteVoyage = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM voyages WHERE id_voyage = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage not found' });
    }
    res.json({ message: 'Voyage deleted', voyage: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllVoyages,
  getVoyageById,
  createVoyage,
  updateVoyage,
  deleteVoyage,
  getVoyageByTel,
};
