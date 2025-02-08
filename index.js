import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import connectDatabase from "./db/index.js";
import error from "./middleware/error.js";

dotenv.config();

const uploadDir = path.join(path.resolve(), "/upload");
fs.access(uploadDir, fs.constants.F_OK, (err) => {
  if (err) {
    fs.mkdir(uploadDir, { recursive: true }, (err) => {});
  }
});
const options = {
  key: fs.readFileSync('/opt/ssl_certs/privkey.pem'),
  cert: fs.readFileSync('/opt/ssl_certs/fullchain.pem'),
};
const app = express();

// middlewares
/* app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
); */
app.use(cors());
app.use("/", express.static(uploadDir));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
connectDatabase();

// initialize routes
app.get("/", (req, res) => {
  res.status(200).send("Server is running!");
});
// Define API routes
app.use("/api/v1/", routes);

app.use(error);

//  // starting our server
const server = https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`Server running on: http://localhost:${process.env.PORT}`);
  console.log(`API Docs: http://localhost:${process.env.PORT}/api/v1/docs`);
});

// starting our server
// const server = app.listen(process.env.PORT, () => {
//   console.log(`Server running on: http://localhost:${process.env.PORT}`);
//   console.log(`API Docs: http://localhost:${process.env.PORT}/api/v1/docs`);
// });

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the http for handling uncaught exception`);
  server.close(() => {
    process.exit(1);
  });
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the http for ${err.message}`);
  console.log(`shutting down the http for unhandle promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
