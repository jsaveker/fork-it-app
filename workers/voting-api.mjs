export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const kv = env.SESSIONS_KV;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    async function jsonResponse(data, init = {}) {
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...cors },
        ...init
      });
    }

    // Helper to get and parse options list
    async function getOptions() {
      const raw = await kv.get('options');
      return raw ? JSON.parse(raw) : [];
    }

    // Routes
    try {
      if (pathname === '/options' && request.method === 'GET') {
        const options = await getOptions();
        return jsonResponse(options);
      }

      if (pathname === '/options' && request.method === 'POST') {
        const { name } = await request.json();
        if (!name) return jsonResponse({ error: 'Name required' }, { status: 400 });
        const options = await getOptions();
        const option = { id: crypto.randomUUID(), name };
        options.push(option);
        await kv.put('options', JSON.stringify(options));
        return jsonResponse(option, { status: 201 });
      }

      if (pathname.startsWith('/options/') && request.method === 'PUT') {
        const id = pathname.split('/')[2];
        const { name } = await request.json();
        let options = await getOptions();
        const idx = options.findIndex(o => o.id === id);
        if (idx === -1) return jsonResponse({ error: 'Not found' }, { status: 404 });
        options[idx].name = name || options[idx].name;
        await kv.put('options', JSON.stringify(options));
        return jsonResponse(options[idx]);
      }

      if (pathname.startsWith('/options/') && request.method === 'DELETE') {
        const id = pathname.split('/')[2];
        let options = await getOptions();
        options = options.filter(o => o.id !== id);
        await kv.put('options', JSON.stringify(options));
        return jsonResponse({ success: true });
      }

      if (pathname === '/sessions' && request.method === 'POST') {
        const id = crypto.randomUUID();
        const session = { id, votes: {}, voters: {} };
        await kv.put(`session:${id}`, JSON.stringify(session), { expirationTtl: 86400 });
        return jsonResponse({ id }, { status: 201 });
      }

      if (pathname.match(/^\/sessions\/[^/]+\/vote$/) && request.method === 'POST') {
        const id = pathname.split('/')[2];
        const { optionId, userId } = await request.json();
        if (!optionId || !userId) return jsonResponse({ error: 'optionId and userId required' }, { status: 400 });
        const data = await kv.get(`session:${id}`);
        if (!data) return jsonResponse({ error: 'Session not found' }, { status: 404 });
        const session = JSON.parse(data);
        if (session.voters[userId]) return jsonResponse({ error: 'Already voted' }, { status: 400 });
        session.voters[userId] = optionId;
        session.votes[optionId] = (session.votes[optionId] || 0) + 1;
        await kv.put(`session:${id}`, JSON.stringify(session), { expirationTtl: 86400 });
        return jsonResponse(session);
      }

      if (pathname.match(/^\/sessions\/[^/]+\/results$/) && request.method === 'GET') {
        const id = pathname.split('/')[2];
        const data = await kv.get(`session:${id}`);
        if (!data) return jsonResponse({ error: 'Session not found' }, { status: 404 });
        const session = JSON.parse(data);
        return jsonResponse(session.votes);
      }

      return jsonResponse({ error: 'Not found' }, { status: 404 });
    } catch (err) {
      return jsonResponse({ error: err.message }, { status: 500 });
    }
  }
};
