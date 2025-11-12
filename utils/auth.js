import { verify } from 'jsonwebtoken';

const getUserFromToken = (token) => {
  try {
    if (!token) return null;
    return verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export default { getUserFromToken };
