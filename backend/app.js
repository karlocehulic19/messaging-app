const express = require("express");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const messageRouter = require("./routes/messageRouter");
const app = express();
const cors = require("cors");
const { corsConfig } = require("./config/cors");

app.use(cors(...corsConfig));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

require("./config/passport").config();

app.use("/", authRouter);
app.use("/users", userRouter);
app.use("/messages", messageRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}`));
