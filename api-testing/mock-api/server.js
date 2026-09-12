import http from 'node:http';

const port = Number(process.env.PORT || 4010);
const validToken = 'portfolio-demo-token';

let tasks;
let nextTaskId;
let requestSequence;

function resetState() {
  tasks = new Map();
  nextTaskId = 1;
  requestSequence = 1;
}

resetState();

function send(res, status, payload) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'X-Request-Id': `REQ-${String(requestSequence++).padStart(4, '0')}`,
  };

  if (status === 204) {
    res.writeHead(status, headers);
    res.end();
    return;
  }

  const body = JSON.stringify(payload);
  res.writeHead(status, {
    ...headers,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function error(res, status, code, message) {
  send(res, status, { error: { code, message } });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function isAuthorized(req) {
  return req.headers.authorization === `Bearer ${validToken}`;
}

function taskPayload(task) {
  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    completed: task.completed,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method || 'GET';

  try {
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      });
      res.end();
      return;
    }

    if (method === 'POST' && url.pathname === '/__reset') {
      resetState();
      send(res, 200, { status: 'reset', taskCount: 0 });
      return;
    }

    if (method === 'GET' && url.pathname === '/health') {
      send(res, 200, {
        status: 'ok',
        service: 'qa-portfolio-api',
        version: '1.0.0',
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/auth/login') {
      const body = await readJson(req);
      if (body.email !== 'qa.student@example.test' || body.password !== 'portfolio-pass') {
        error(res, 401, 'AUTH_INVALID', 'Invalid credentials');
        return;
      }

      send(res, 200, {
        accessToken: validToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
      return;
    }

    if (url.pathname === '/tasks' || url.pathname.startsWith('/tasks/')) {
      if (!isAuthorized(req)) {
        error(res, 401, 'AUTH_REQUIRED', 'A valid bearer token is required');
        return;
      }

      if (method === 'GET' && url.pathname === '/tasks') {
        const data = Array.from(tasks.values()).map(taskPayload);
        send(res, 200, { data, count: data.length });
        return;
      }

      if (method === 'POST' && url.pathname === '/tasks') {
        const body = await readJson(req);
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        const allowedPriorities = ['low', 'medium', 'high'];

        if (!title || (body.priority && !allowedPriorities.includes(body.priority))) {
          error(
            res,
            400,
            'VALIDATION_ERROR',
            'title is required and priority must be low, medium, or high'
          );
          return;
        }

        const now = new Date().toISOString();
        const task = {
          id: `TASK-${nextTaskId++}`,
          title,
          priority: body.priority || 'medium',
          completed: false,
          createdAt: now,
          updatedAt: now,
        };
        tasks.set(task.id, task);
        send(res, 201, { data: taskPayload(task) });
        return;
      }

      const id = decodeURIComponent(url.pathname.slice('/tasks/'.length));
      const task = tasks.get(id);
      if (!task) {
        error(res, 404, 'TASK_NOT_FOUND', `Task ${id} was not found`);
        return;
      }

      if (method === 'GET') {
        send(res, 200, { data: taskPayload(task) });
        return;
      }

      if (method === 'PATCH') {
        const body = await readJson(req);
        if (body.title !== undefined) {
          const title = typeof body.title === 'string' ? body.title.trim() : '';
          if (!title) {
            error(res, 400, 'VALIDATION_ERROR', 'title cannot be empty');
            return;
          }
          task.title = title;
        }
        if (body.completed !== undefined) task.completed = Boolean(body.completed);
        task.updatedAt = new Date().toISOString();
        send(res, 200, { data: taskPayload(task) });
        return;
      }

      if (method === 'DELETE') {
        tasks.delete(id);
        send(res, 204);
        return;
      }
    }

    error(res, 404, 'ROUTE_NOT_FOUND', `${method} ${url.pathname} is not available`);
  } catch (caught) {
    if (caught instanceof SyntaxError) {
      error(res, 400, 'INVALID_JSON', 'Request body must be valid JSON');
      return;
    }
    error(res, 500, 'INTERNAL_ERROR', 'Unexpected mock API error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`QA portfolio mock API listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
