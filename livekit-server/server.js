require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const httpServer = http.createServer(app);

const PORT = Number(process.env.PORT || 3001);
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error("Missing LiveKit environment variables.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

/*
|--------------------------------------------------------------------------
| Temporary in-memory storage
|--------------------------------------------------------------------------
|
| Later we will move this into SQLite/PostgreSQL/Redis.
|
*/

const onlineUsers = new Map();

/*
callId => {
  callId,
  roomName,
  callerId,
  receiverId,
  callType,
  status,
  createdAt,
  answeredAt,
  endedAt
}
*/
const calls = new Map();

const normalizeShadowBoxId = (value) =>
  String(value || "").trim().toUpperCase();

const isValidShadowBoxId = (value) =>
  /^SBX-\d{6}$/.test(normalizeShadowBoxId(value));

function getUserSockets(shadowBoxId) {
  return onlineUsers.get(normalizeShadowBoxId(shadowBoxId)) || new Set();
}

function isUserOnline(shadowBoxId) {
  return getUserSockets(shadowBoxId).size > 0;
}

function sendToUser(shadowBoxId, eventName, payload) {
  const sockets = getUserSockets(shadowBoxId);

  sockets.forEach((socketId) => {
    io.to(socketId).emit(eventName, payload);
  });
}

function addOnlineSocket(shadowBoxId, socketId) {
  const normalizedId = normalizeShadowBoxId(shadowBoxId);

  if (!onlineUsers.has(normalizedId)) {
    onlineUsers.set(normalizedId, new Set());
  }

  onlineUsers.get(normalizedId).add(socketId);
}

function removeOnlineSocket(shadowBoxId, socketId) {
  const normalizedId = normalizeShadowBoxId(shadowBoxId);
  const sockets = onlineUsers.get(normalizedId);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(normalizedId);
  }
}

function findActiveCallForUser(shadowBoxId) {
  const normalizedId = normalizeShadowBoxId(shadowBoxId);

  return Array.from(calls.values()).find((call) => {
    const belongsToCall =
      call.callerId === normalizedId ||
      call.receiverId === normalizedId;

    const isActive =
      call.status === "ringing" ||
      call.status === "accepted" ||
      call.status === "connected";

    return belongsToCall && isActive;
  });
}

function getOtherParticipant(call, shadowBoxId) {
  const normalizedId = normalizeShadowBoxId(shadowBoxId);

  return call.callerId === normalizedId
    ? call.receiverId
    : call.callerId;
}

function publicCallData(call) {
  return {
    callId: call.callId,
    roomName: call.roomName,
    callerId: call.callerId,
    receiverId: call.receiverId,
    callType: call.callType,
    status: call.status,
    createdAt: call.createdAt,
    answeredAt: call.answeredAt || null,
    endedAt: call.endedAt || null,
  };
}

async function generateLiveKitToken({
  identity,
  roomName,
  callType,
}) {
  const token = new AccessToken(
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET,
    {
      identity,
      name: identity,
      ttl: "2h",
      metadata: JSON.stringify({
        shadowBoxId: identity,
        callType,
      }),
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await token.toJwt();
}

/*
|--------------------------------------------------------------------------
| HTTP routes
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "shadow-box-call-server",
    livekitConfigured: true,
    onlineUsers: onlineUsers.size,
    activeCalls: Array.from(calls.values()).filter(
      (call) =>
        call.status === "ringing" ||
        call.status === "accepted" ||
        call.status === "connected"
    ).length,
  });
});

/*
|--------------------------------------------------------------------------
| Secure token endpoint
|--------------------------------------------------------------------------
|
| A token is generated only when:
|
| 1. The call exists.
| 2. The call was accepted.
| 3. The requested ID is callerId or receiverId.
|
| A third Shadow Box ID cannot join the room.
|
*/

app.post("/token", async (req, res) => {
  try {
    const callId = String(req.body.callId || "").trim();
    const shadowBoxId = normalizeShadowBoxId(req.body.shadowBoxId);

    if (!callId || !isValidShadowBoxId(shadowBoxId)) {
      return res.status(400).json({
        error: "callId and a valid shadowBoxId are required.",
      });
    }

    const call = calls.get(callId);

    if (!call) {
      return res.status(404).json({
        error: "Call not found.",
      });
    }

    if (
      call.status !== "accepted" &&
      call.status !== "connected"
    ) {
      return res.status(403).json({
        error: "Call has not been accepted.",
      });
    }

    const isParticipant =
      shadowBoxId === call.callerId ||
      shadowBoxId === call.receiverId;

    if (!isParticipant) {
      return res.status(403).json({
        error: "This Shadow Box ID is not authorized for the call.",
      });
    }

    const token = await generateLiveKitToken({
      identity: shadowBoxId,
      roomName: call.roomName,
      callType: call.callType,
    });

    res.json({
      token,
      url: LIVEKIT_URL,
      call: publicCallData(call),
    });
  } catch (error) {
    console.error("Token generation error:", error);

    res.status(500).json({
      error: "Could not generate LiveKit token.",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Socket authentication
|--------------------------------------------------------------------------
|
| Each installation connects using its permanent Shadow Box ID.
|
*/

io.use((socket, next) => {
  const shadowBoxId = normalizeShadowBoxId(
    socket.handshake.auth?.shadowBoxId
  );

  if (!isValidShadowBoxId(shadowBoxId)) {
    return next(new Error("A valid Shadow Box ID is required."));
  }

  socket.shadowBoxId = shadowBoxId;
  next();
});

/*
|--------------------------------------------------------------------------
| Signaling events
|--------------------------------------------------------------------------
*/

io.on("connection", (socket) => {
  const shadowBoxId = socket.shadowBoxId;

  addOnlineSocket(shadowBoxId, socket.id);

  console.log(
    `[SIGNAL] ${shadowBoxId} connected with socket ${socket.id}`
  );

  socket.emit("signal:ready", {
    shadowBoxId,
    connected: true,
  });

  socket.on("call:start", (payload = {}, callback = () => {}) => {
    try {
      const callerId = shadowBoxId;
      const receiverId = normalizeShadowBoxId(payload.receiverId);
      const callType =
        payload.callType === "video" ? "video" : "voice";

      if (!isValidShadowBoxId(receiverId)) {
        return callback({
          ok: false,
          error: "Invalid receiver Shadow Box ID.",
        });
      }

      if (callerId === receiverId) {
        return callback({
          ok: false,
          error: "You cannot call your own Shadow Box ID.",
        });
      }

      const callerActiveCall = findActiveCallForUser(callerId);

      if (callerActiveCall) {
        return callback({
          ok: false,
          error: "You already have an active call.",
        });
      }

      const receiverActiveCall = findActiveCallForUser(receiverId);

      if (receiverActiveCall) {
        return callback({
          ok: false,
          error: "Receiver is currently busy.",
          reason: "busy",
        });
      }

      if (!isUserOnline(receiverId)) {
        return callback({
          ok: false,
          error: "Receiver is offline.",
          reason: "offline",
        });
      }

      const callId = crypto.randomUUID();
      const roomName = `shadowbox_call_${callId}`;

      const call = {
        callId,
        roomName,
        callerId,
        receiverId,
        callType,
        status: "ringing",
        createdAt: new Date().toISOString(),
        answeredAt: null,
        endedAt: null,
      };

      calls.set(callId, call);

      const callPayload = publicCallData(call);

      sendToUser(receiverId, "call:incoming", callPayload);
      sendToUser(callerId, "call:ringing", callPayload);

      callback({
        ok: true,
        call: callPayload,
      });

      console.log(
        `[CALL] ${callerId} is calling ${receiverId}. Call ID: ${callId}`
      );
    } catch (error) {
      console.error("call:start error:", error);

      callback({
        ok: false,
        error: "Could not start the call.",
      });
    }
  });

  socket.on("call:accept", (payload = {}, callback = () => {}) => {
    try {
      const callId = String(payload.callId || "").trim();
      const call = calls.get(callId);

      if (!call) {
        return callback({
          ok: false,
          error: "Call not found.",
        });
      }

      if (call.receiverId !== shadowBoxId) {
        return callback({
          ok: false,
          error: "Only the receiver can accept this call.",
        });
      }

      if (call.status !== "ringing") {
        return callback({
          ok: false,
          error: `Call is already ${call.status}.`,
        });
      }

      call.status = "accepted";
      call.answeredAt = new Date().toISOString();

      calls.set(callId, call);

      const callPayload = publicCallData(call);

      sendToUser(call.callerId, "call:accepted", callPayload);
      sendToUser(call.receiverId, "call:accepted", callPayload);

      callback({
        ok: true,
        call: callPayload,
      });

      console.log(
        `[CALL] ${shadowBoxId} accepted call ${callId}`
      );
    } catch (error) {
      console.error("call:accept error:", error);

      callback({
        ok: false,
        error: "Could not accept the call.",
      });
    }
  });

  socket.on("call:decline", (payload = {}, callback = () => {}) => {
    try {
      const callId = String(payload.callId || "").trim();
      const call = calls.get(callId);

      if (!call) {
        return callback({
          ok: false,
          error: "Call not found.",
        });
      }

      if (call.receiverId !== shadowBoxId) {
        return callback({
          ok: false,
          error: "Only the receiver can decline this call.",
        });
      }

      if (call.status !== "ringing") {
        return callback({
          ok: false,
          error: `Call is already ${call.status}.`,
        });
      }

      call.status = "declined";
      call.endedAt = new Date().toISOString();

      calls.set(callId, call);

      const callPayload = publicCallData(call);

      sendToUser(call.callerId, "call:declined", callPayload);
      sendToUser(call.receiverId, "call:declined", callPayload);

      callback({
        ok: true,
        call: callPayload,
      });

      console.log(
        `[CALL] ${shadowBoxId} declined call ${callId}`
      );
    } catch (error) {
      console.error("call:decline error:", error);

      callback({
        ok: false,
        error: "Could not decline the call.",
      });
    }
  });

  socket.on("call:cancel", (payload = {}, callback = () => {}) => {
    try {
      const callId = String(payload.callId || "").trim();
      const call = calls.get(callId);

      if (!call) {
        return callback({
          ok: false,
          error: "Call not found.",
        });
      }

      if (call.callerId !== shadowBoxId) {
        return callback({
          ok: false,
          error: "Only the caller can cancel the call.",
        });
      }

      if (call.status !== "ringing") {
        return callback({
          ok: false,
          error: `Call is already ${call.status}.`,
        });
      }

      call.status = "cancelled";
      call.endedAt = new Date().toISOString();

      calls.set(callId, call);

      const callPayload = publicCallData(call);

      sendToUser(call.receiverId, "call:cancelled", callPayload);
      sendToUser(call.callerId, "call:cancelled", callPayload);

      callback({
        ok: true,
        call: callPayload,
      });

      console.log(
        `[CALL] ${shadowBoxId} cancelled call ${callId}`
      );
    } catch (error) {
      console.error("call:cancel error:", error);

      callback({
        ok: false,
        error: "Could not cancel the call.",
      });
    }
  });

  socket.on("call:connected", (payload = {}) => {
    const callId = String(payload.callId || "").trim();
    const call = calls.get(callId);

    if (!call) {
      return;
    }

    const isParticipant =
      shadowBoxId === call.callerId ||
      shadowBoxId === call.receiverId;

    if (!isParticipant) {
      return;
    }

    if (call.status === "accepted") {
      call.status = "connected";
      calls.set(callId, call);
    }

    const otherParticipant = getOtherParticipant(
      call,
      shadowBoxId
    );

    sendToUser(otherParticipant, "call:peer-connected", {
      callId,
      shadowBoxId,
    });
  });

  socket.on("call:end", (payload = {}, callback = () => {}) => {
    try {
      const callId = String(payload.callId || "").trim();
      const call = calls.get(callId);

      if (!call) {
        return callback({
          ok: false,
          error: "Call not found.",
        });
      }

      const isParticipant =
        shadowBoxId === call.callerId ||
        shadowBoxId === call.receiverId;

      if (!isParticipant) {
        return callback({
          ok: false,
          error: "You are not part of this call.",
        });
      }

      call.status = "ended";
      call.endedAt = new Date().toISOString();

      calls.set(callId, call);

      const callPayload = {
        ...publicCallData(call),
        endedBy: shadowBoxId,
      };

      sendToUser(call.callerId, "call:ended", callPayload);
      sendToUser(call.receiverId, "call:ended", callPayload);

      callback({
        ok: true,
        call: callPayload,
      });

      console.log(
        `[CALL] ${shadowBoxId} ended call ${callId}`
      );
    } catch (error) {
      console.error("call:end error:", error);

      callback({
        ok: false,
        error: "Could not end the call.",
      });
    }
  });

  socket.on("disconnect", () => {
    removeOnlineSocket(shadowBoxId, socket.id);

    console.log(
      `[SIGNAL] ${shadowBoxId} disconnected from socket ${socket.id}`
    );
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log("     SHADOW BOX CALL SERVER");
  console.log("====================================");
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`LiveKit URL: ${LIVEKIT_URL}`);
  console.log("Private call signaling is active.");
});