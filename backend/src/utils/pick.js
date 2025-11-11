/**
 * Pick only allowed fields from an object
 * Example:
 * pick(req.query, ["page", "limit"])
 */
const pick = (obj, keys) => {
  const result = {};

  if (!obj || typeof obj !== "object") return result;

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });

  return result;
};

export default pick;
