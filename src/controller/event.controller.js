import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../model/event.model.js";
import mongoose from "mongoose";

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      eventType, 
      price, 
      startDate, 
      endDate, 
      capacity, 
      location 
    } = req.body;

    if (!title || !description || !eventType || !price || !startDate || !endDate) {
      throw new ApiError(400, "All required fields must be provided");
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new ApiError(400, "End date must be after start date");
    }

    const event = await Event.create({
      title,
      description,
      eventType,
      price,
      startDate,
      endDate,
      capacity: capacity || 100,
      location,
      Owner: req.user._id,
      participants: [],
      status: "draft"
    });

    return res
      .status(201)
      .json(new ApiResponse(201, event, "Event created successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      eventType, 
      status, 
      searchTerm = "" 
    } = req.query;
    
    const query = {};
    
    // Add filters if provided
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;
    
    // Add search term to query
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } }
      ];
    }

    const events = await Event.find(query)
      .populate("Owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalEvents = await Event.countDocuments(query);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200, 
          {
            events,
            totalEvents,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEvents / parseInt(limit))
          },
          "Events fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const event = await Event.findById(eventId)
      .populate("Owner", "firstName lastName email")
      .populate("participants", "firstName lastName email");
    
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event fetched successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    
    // Check if user is the owner
    if (event.Owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You do not have permission to update this event");
    }
    
    const { 
      title, 
      description, 
      eventType, 
      price, 
      startDate, 
      endDate, 
      capacity, 
      status,
      location 
    } = req.body;
    
    // Check dates if both are provided
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw new ApiError(400, "End date must be after start date");
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          title: title || event.title,
          description: description || event.description,
          eventType: eventType || event.eventType,
          price: price || event.price,
          startDate: startDate || event.startDate,
          endDate: endDate || event.endDate,
          capacity: capacity || event.capacity,
          status: status || event.status,
          location: location || event.location
        }
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    
    // Check if user is the owner
    if (event.Owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new ApiError(403, "You do not have permission to delete this event");
    }
    
    await Event.findByIdAndDelete(eventId);
    
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Event deleted successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    
    if (event.status !== "published") {
      throw new ApiError(400, "Cannot register for an event that is not published");
    }
    
    // Check if already registered
    if (event.participants.includes(req.user._id)) {
      throw new ApiError(400, "You are already registered for this event");
    }
    
    // Check if event is full
    if (event.participants.length >= event.capacity) {
      throw new ApiError(400, "Event is at full capacity");
    }
    
    event.participants.push(req.user._id);
    await event.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, event, "Successfully registered for the event"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      throw new ApiError(400, "Event ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    
    // Check if registered
    if (!event.participants.includes(req.user._id)) {
      throw new ApiError(400, "You are not registered for this event");
    }
    
    event.participants = event.participants.filter(
      participant => participant.toString() !== req.user._id.toString()
    );
    
    await event.save();
    
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully cancelled registration"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Get my events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ Owner: req.user._id })
      .sort({ createdAt: -1 });
    
    return res
      .status(200)
      .json(new ApiResponse(200, events, "Events fetched successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

// Get events I'm registered for
const getMyRegisteredEvents = async (req, res) => {
  try {
    const events = await Event.find({ participants: req.user._id })
      .populate("Owner", "firstName lastName email")
      .sort({ startDate: 1 });
    
    return res
      .status(200)
      .json(new ApiResponse(200, events, "Registered events fetched successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getMyRegisteredEvents
};