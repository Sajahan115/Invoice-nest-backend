import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "100m",
    }
  );
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30m" } // short-lived
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "3d" } // long-lived
  );
};
