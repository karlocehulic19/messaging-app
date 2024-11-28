const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}`));
