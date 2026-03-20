require('dotenv').config();
const express = require('express');
const voyagesRoutes = require('./src/routes/voyages.routes');
const bagageRoutes = require("./src/routes/Lunggages.routes");
const agencesRoutes = require('./src/routes/agences.routes');
const usersRoutes = require('./src/routes/users.routes');
const authRoutes = require('./src/routes/auth.routes');
const cardRoutes = require("./src/routes/card.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/voyages', voyagesRoutes);
app.use("/lunggages", bagageRoutes);
app.use('/agences', agencesRoutes);
app.use('/users', usersRoutes);
app.use("/cards", cardRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
