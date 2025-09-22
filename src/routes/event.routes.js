import { Router } from "express";
import { 
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getMyRegisteredEvents
} from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:eventId", getEventById);

// Protected routes
router.post("/", verifyJWT, createEvent);
router.patch("/:eventId", verifyJWT, updateEvent);
router.delete("/:eventId", verifyJWT, deleteEvent);
router.post("/:eventId/register", verifyJWT, registerForEvent);
router.delete("/:eventId/register", verifyJWT, cancelRegistration);
router.get("/user/my-events", verifyJWT, getMyEvents);
router.get("/user/registered", verifyJWT, getMyRegisteredEvents);

export default router;