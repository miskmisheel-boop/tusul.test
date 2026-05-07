const crypto = require("crypto");

const { env } = require("../config/env");
const AppError = require("../utils/appError");
const { readDb, updateDb } = require("./dbService");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createPasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");

  if (!salt || !hash) {
    return false;
  }

  const incoming = createPasswordHash(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(incoming, "hex"));
}

function createToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const signature = crypto.createHmac("sha256", env.authSecret).update(raw).digest("hex");
  return `${raw}.${signature}`;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    preferredLanguage: user.preferredLanguage || "en",
    createdAt: user.createdAt
  };
}

function validateCredentials({ fullName, email, password }) {
  if (!String(fullName || "").trim()) {
    throw new AppError("Full name is required.", 400, "FULL_NAME_REQUIRED");
  }

  if (!normalizeEmail(email) || !normalizeEmail(email).includes("@")) {
    throw new AppError("A valid email is required.", 400, "EMAIL_REQUIRED");
  }

  if (String(password || "").length < 6) {
    throw new AppError("Password must be at least 6 characters.", 400, "PASSWORD_TOO_SHORT");
  }
}

async function signup({ fullName, email, password, preferredLanguage = "en" }) {
  validateCredentials({ fullName, email, password });
  const normalizedEmail = normalizeEmail(email);
  const userId = crypto.randomUUID();
  const sessionToken = createToken();
  const now = new Date().toISOString();

  const db = await updateDb((currentDb) => {
    if (currentDb.users.some((user) => user.email === normalizedEmail)) {
      throw new AppError("An account with this email already exists.", 409, "EMAIL_IN_USE");
    }

    const user = {
      id: userId,
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash: createPasswordHash(password),
      preferredLanguage: preferredLanguage === "mn" ? "mn" : "en",
      createdAt: now
    };

    currentDb.users.push(user);
    currentDb.sessions.push({
      token: sessionToken,
      userId,
      createdAt: now,
      expiresAt: new Date(Date.now() + env.sessionTtlMs).toISOString()
    });

    return currentDb;
  });

  const createdUser = db.users.find((user) => user.id === userId);

  return {
    token: sessionToken,
    user: sanitizeUser(createdUser)
  };
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !String(password || "").trim()) {
    throw new AppError("Email and password are required.", 400, "LOGIN_REQUIRED");
  }

  const db = await readDb();
  const user = db.users.find((entry) => entry.email === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const token = createToken();
  const now = new Date().toISOString();

  await updateDb((currentDb) => {
    currentDb.sessions = currentDb.sessions.filter((session) => new Date(session.expiresAt).getTime() > Date.now());
    currentDb.sessions.push({
      token,
      userId: user.id,
      createdAt: now,
      expiresAt: new Date(Date.now() + env.sessionTtlMs).toISOString()
    });
    return currentDb;
  });

  return {
    token,
    user: sanitizeUser(user)
  };
}

async function getUserByToken(token) {
  if (!token) {
    return null;
  }

  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token);

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await logout(token);
    return null;
  }

  const user = db.users.find((entry) => entry.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

async function logout(token) {
  if (!token) {
    return;
  }

  await updateDb((currentDb) => {
    currentDb.sessions = currentDb.sessions.filter((session) => session.token !== token);
    return currentDb;
  });
}

module.exports = {
  signup,
  login,
  logout,
  getUserByToken
};
