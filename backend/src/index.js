import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import eventGroupsRoutes from "./routes/eventGroups.js";
import eventsRoutes from "./routes/events.js";
import attendanceRoutes from "./routes/attendance.js";

import { requireAuth } from "./middleware/auth.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// PUBLIC
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

// PROTECTED (organizator)
app.use("/api/event-groups", requireAuth, eventGroupsRoutes);
app.use("/api", requireAuth, eventsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://0.0.0.0:${PORT}`);
});
