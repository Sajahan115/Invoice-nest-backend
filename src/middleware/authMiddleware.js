import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];

    if (!token) {
      const err = new Error("Token not found, authorization denied");
      err.status = 401;
      return next(err);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      console.log("User decoded from token:", decoded);
      return next();
    } catch (error) {
      console.log(error);
      const err = new Error("Token is invalid, authorization denied");
      err.status = 400;
      return next(err);
    }
  }

  const err = new Error("Authorization header not found");
  err.status = 401;
  return next(err);
};

export const verifyAdmin = (req, res, next) => {
  console.log("******** ",req.user)
  if (!req.user || req.user.role !== "admin") {
    const err = new Error("Unauthorized access, admin only");
    err.status = 403;
    return next(err);
  }
  next();
};

export const verifyAdminOrSelf = (req, res, next) => {
  const loggedInUser = req.user;
  const requestedUserId = req.params.userId;

  if (
    loggedInUser.role === "admin" ||
    String(loggedInUser.id) === String(requestedUserId)
  ) {
    return next();
  }

  const err = new Error("Unauthorized access");
  err.status = 403;
  return next(err);
};
