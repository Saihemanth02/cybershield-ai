import rateLimit from 'express-rate-limit';

// Standard Rate Limiter for Academy API points: Maximum 60 queries per 15 minutes per IP
export const academyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too Many Requests",
    message: "Rate limit exceeded. Security firewalls are throttling queries. Please wait 15 minutes before retrying."
  }
});

// Middleware validation for the Adaptive Syllabus Generator (/api/generate-plan)
export const validatePlanInput = (req, res, next) => {
  const { name, level, goal, hours, struggle } = req.body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Required parameter 'name' must be a non-empty string."
    });
  }

  const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  if (typeof level !== 'string' || !validLevels.includes(level.toLowerCase())) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Required parameter 'level' must be one of: ${validLevels.join(', ')}.`
    });
  }

  if (typeof goal !== 'string' || goal.trim().length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Required parameter 'goal' must be a non-empty string."
    });
  }

  const parsedHours = Number(hours);
  if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 168) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Required parameter 'hours' must be a valid number between 1 and 168."
    });
  }

  if (typeof struggle !== 'string' || struggle.trim().length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Required parameter 'struggle' must be a non-empty string."
    });
  }

  // Sanitize values
  req.sanitizedBody = {
    name: name.trim(),
    level: level.trim().toLowerCase(),
    goal: goal.trim(),
    hours: parsedHours,
    struggle: struggle.trim()
  };

  next();
};

// Middleware validation for the security chatbot (/api/chat)
export const validateChatInput = (req, res, next) => {
  const { message, history } = req.body;

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Required parameter 'message' must be a non-empty string."
    });
  }

  if (history !== undefined) {
    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Optional parameter 'history' must be an array of chat history objects."
      });
    }

    // Validate structure of history items
    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      if (typeof item !== 'object' || item === null) {
        return res.status(400).json({
          error: "Bad Request",
          message: `History entry at index ${i} is not a valid object.`
        });
      }

      if (item.role !== 'user' && item.role !== 'model') {
        return res.status(400).json({
          error: "Bad Request",
          message: `History entry at index ${i} has an invalid role. Must be 'user' or 'model'.`
        });
      }

      if (typeof item.message !== 'string' || item.message.trim().length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `History entry at index ${i} must have a non-empty string 'message'.`
        });
      }
    }
  }

  req.sanitizedBody = {
    message: message.trim(),
    history: history ? history.map(h => ({ role: h.role, message: h.message.trim() })) : []
  };

  next();
};
