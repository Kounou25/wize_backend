const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Génère un access token (15min)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, agence_id: user.agence_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Génère un refresh token (7j)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// POST /auth/login
const login = async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'login et password sont requis' });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, a.agence AS agence_nom
       FROM users u
       LEFT JOIN agences a ON a.id = u.agence_id
       WHERE u.phone = $1 OR u.email = $1`,
      [login]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Calculer la date d'expiration du refresh token
    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Stocker le refresh token en base
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '15m',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        agence_id: user.agence_id,
        agence_nom: user.agence_nom,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/refresh
const refresh = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token est requis' });
  }

  try {
    // Vérifier la signature JWT du refresh token
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Refresh token invalide ou expiré' });
    }

    // Vérifier que le token existe en base et n'est pas expiré
    const tokenResult = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [refresh_token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({ error: 'Refresh token révoqué ou expiré' });
    }

    // Récupérer les infos de l'utilisateur
    const userResult = await pool.query(
      'SELECT id, role, agence_id, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].status !== 'active') {
      return res.status(403).json({ error: 'Utilisateur introuvable ou désactivé' });
    }

    const user = userResult.rows[0];

    // Rotation du refresh token : supprimer l'ancien, créer un nouveau
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newDecoded = jwt.decode(newRefreshToken);
    const newExpiresAt = new Date(newDecoded.exp * 1000);

    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, newRefreshToken, newExpiresAt]
    );

    res.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/logout — déconnexion de l'appareil courant
const logout = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token est requis' });
  }

  try {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
    res.json({ message: 'Déconnecté avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/logout-all — déconnexion de tous les appareils
const logoutAll = async (req, res) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Déconnecté de tous les appareils' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /auth/me — profil de l'utilisateur connecté
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.agence_id,
              a.agence AS agence_nom, u.created_at
       FROM users u
       LEFT JOIN agences a ON a.id = u.agence_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { login, refresh, logout, logoutAll, getMe };
