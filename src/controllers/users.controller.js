const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /users — liste tous les utilisateurs (sans mot de passe)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.agence_id,
              a.agence AS agence_nom, u.created_at
       FROM users u
       LEFT JOIN agences a ON a.id = u.agence_id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users/:id — un utilisateur par id
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.agence_id,
              a.agence AS agence_nom, u.created_at
       FROM users u
       LEFT JOIN agences a ON a.id = u.agence_id
       WHERE u.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /users — créer un utilisateur (admin uniquement)
const createUser = async (req, res) => {
  const { full_name, email, phone, role, password, agence_id } = req.body;

  if (!full_name || !phone || !password) {
    return res.status(400).json({ error: 'full_name, phone et password sont requis' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, role, password, agence_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone, role, status, agence_id, created_at`,
      [full_name, email || null, phone, role || 'agent', hashedPassword, agence_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email ou téléphone déjà utilisé' });
    }
    res.status(500).json({ error: err.message });
  }
};

// PUT /users/:id — mettre à jour un utilisateur
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, role, status, agence_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET full_name = $1, email = $2, phone = $3, role = $4, status = $5, agence_id = $6
       WHERE id = $7
       RETURNING id, full_name, email, phone, role, status, agence_id, created_at`,
      [full_name, email || null, phone, role, status, agence_id || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email ou téléphone déjà utilisé' });
    }
    res.status(500).json({ error: err.message });
  }
};

// PATCH /users/:id/password — changer le mot de passe
const changePassword = async (req, res) => {
  const { id } = req.params;
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ error: 'old_password et new_password sont requis' });
  }

  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const valid = await bcrypt.compare(old_password, userResult.rows[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /users/:id — supprimer un utilisateur
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, full_name, phone',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, changePassword, deleteUser };
