require('dotenv').config();
const express = require('express');
const voyagesRoutes = require('./src/routes/voyages.routes');
const bagageRoutes = require("./src/routes/Lunggages.routes");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/voyages', voyagesRoutes);
app.use("/lunggages", bagageRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
