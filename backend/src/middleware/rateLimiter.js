import ratelimit from "../config/upstach.js";

const ratelimiter = async (req, res, next) => {
  try {
    const key = `${req.ip}:${req.path}`;
    // const { success } = await ratelimit.limit("my-rate-limit");
    const { success } = await ratelimit.limit(key);

    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }

    next();
  } catch (error) {
    console.log("Rate limiter error", error);
  }
};

export default ratelimiter;
