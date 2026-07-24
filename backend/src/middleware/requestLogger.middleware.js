/**
 * Express middleware that logs every incoming API request with:
 *  - HTTP Method   (color-coded via ANSI)
 *  - Request URL
 *  - Response Status Code (color-coded by range)
 *  - Response Time in ms
 *
 * Output example:
 *  [API] POST   /api/v1/users → 201  (48ms)
 *  [API] GET    /api/v1/employees → 200  (12ms)
 *  [API] POST   /api/v1/auth/login → 401  (5ms)
 */

// ANSI color helpers
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const colorMethod = (method) => {
  const map = {
    GET: c.cyan,
    POST: c.green,
    PUT: c.yellow,
    PATCH: c.yellow,
    DELETE: c.red,
  };
  const color = map[method] || c.white;
  return `${c.bright}${color}${method.padEnd(6)}${c.reset}`;
};

const colorStatus = (status) => {
  let color = c.white;
  if (status >= 500) color = c.red;
  else if (status >= 400) color = c.yellow;
  else if (status >= 300) color = c.cyan;
  else if (status >= 200) color = c.green;
  return `${c.bright}${color}${status}${c.reset}`;
};

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl } = req;

  // Intercept res.end to read the final status code after route handlers run
  const originalEnd = res.end.bind(res);

  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const durationStr = `${c.dim}(${duration}ms)${c.reset}`;

    console.log(
      `${c.gray}[API]${c.reset} ${colorMethod(method)} ${c.white}${originalUrl}${c.reset} ${c.gray}→${c.reset} ${colorStatus(status)}  ${durationStr}`
    );

    return originalEnd(...args);
  };

  next();
};
