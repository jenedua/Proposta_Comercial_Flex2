import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './server/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = 'flex-proposta-secret-key-2026';

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // API ROUTES (Backend)
  // ==========================================

  // 1. Registro de Conta e Usuário
  app.post('/api/auth/register', (req, res) => {
    const { company_name, name, email, whatsapp, password } = req.body;
    
    try {
      // Verifica se e-mail já existe
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      const hash = bcrypt.hashSync(password, 10);

      // Transação para garantir que Conta e Usuário sejam criados juntos
      const insertTransaction = db.transaction(() => {
        const insertAccount = db.prepare('INSERT INTO accounts (company_name) VALUES (?)');
        const accountInfo = insertAccount.run(company_name);
        const accountId = accountInfo.lastInsertRowid;

        const insertUser = db.prepare('INSERT INTO users (account_id, name, email, whatsapp, password_hash) VALUES (?, ?, ?, ?, ?)');
        insertUser.run(accountId, name, email, whatsapp, hash);
      });

      insertTransaction();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }

      const token = jwt.sign(
        { userId: user.id, accountId: user.account_id, name: user.name }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      res.json({ token, user: { name: user.name, email: user.email } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Middleware de Autenticação para rotas protegidas
  const requireAuth = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Não autorizado' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token inválido' });
    }
  };

  // 3. Dashboard Stats (Protegido)
  app.get('/api/dashboard/stats', requireAuth, (req: any, res) => {
    const accountId = req.user.accountId;
    
    try {
      const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers WHERE account_id = ?').get(accountId) as any;
      const totalProposals = db.prepare('SELECT COUNT(*) as count FROM proposals WHERE account_id = ?').get(accountId) as any;
      const approvedProposals = db.prepare('SELECT COUNT(*) as count FROM proposals WHERE account_id = ? AND status = "approved"').get(accountId) as any;
      const pendingProposals = db.prepare('SELECT COUNT(*) as count FROM proposals WHERE account_id = ? AND status IN ("draft", "sent")').get(accountId) as any;
      
      // Gráfico: Últimos 6 meses de propostas aprovadas
      const chartData = db.prepare(`
        SELECT strftime('%Y-%m', proposal_date) as month, SUM(total_value) as total
        FROM proposals
        WHERE account_id = ? AND status = 'approved' AND proposal_date >= date('now', '-6 months')
        GROUP BY month
        ORDER BY month ASC
      `).all(accountId);

      // Follow-ups de hoje
      const today = new Date().toISOString().split('T')[0];
      const followUps = db.prepare(`
        SELECT p.*, c.name as customer_name, c.phone as customer_phone
        FROM proposals p
        JOIN customers c ON p.customer_id = c.id
        WHERE p.account_id = ? AND p.followup_date = ? AND p.status != 'approved' AND p.status != 'rejected'
        ORDER BY p.created_at DESC
      `).all(accountId, today);

      res.json({
        totalCustomers: totalCustomers.count,
        totalProposals: totalProposals.count,
        approvedProposals: approvedProposals.count,
        pendingProposals: pendingProposals.count,
        chartData,
        followUps
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // API ROUTES: CUSTOMERS
  // ==========================================
  app.get('/api/customers', requireAuth, (req: any, res) => {
    try {
      const customers = db.prepare('SELECT * FROM customers WHERE account_id = ? ORDER BY name').all(req.user.accountId);
      res.json(customers);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post('/api/customers', requireAuth, (req: any, res) => {
    const { name, email, phone } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO customers (account_id, name, email, phone) VALUES (?, ?, ?, ?)');
      const info = stmt.run(req.user.accountId, name, email, phone);
      res.json({ id: info.lastInsertRowid, name, email, phone });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // ==========================================
  // API ROUTES: PRODUCTS & SERVICES
  // ==========================================
  app.get('/api/products', requireAuth, (req: any, res) => {
    try {
      const products = db.prepare('SELECT * FROM products_services WHERE account_id = ? ORDER BY description').all(req.user.accountId);
      res.json(products);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post('/api/products', requireAuth, (req: any, res) => {
    const { type, description, price } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO products_services (account_id, type, description, price) VALUES (?, ?, ?, ?)');
      const info = stmt.run(req.user.accountId, type, description, price);
      res.json({ id: info.lastInsertRowid, type, description, price });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // ==========================================
  // API ROUTES: PROPOSALS
  // ==========================================
  app.get('/api/proposals', requireAuth, (req: any, res) => {
    try {
      const proposals = db.prepare(`
        SELECT p.*, c.name as customer_name, c.phone as customer_phone
        FROM proposals p 
        JOIN customers c ON p.customer_id = c.id 
        WHERE p.account_id = ? 
        ORDER BY p.created_at DESC
      `).all(req.user.accountId);
      res.json(proposals);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post('/api/proposals', requireAuth, (req: any, res) => {
    const { customer_id, title, total_value, proposal_date, followup_date, notes, items } = req.body;
    const accountId = req.user.accountId;
    const uuid = crypto.randomUUID();

    try {
      const insertTx = db.transaction(() => {
        const lastProp = db.prepare('SELECT MAX(sequential_number) as max_seq FROM proposals WHERE account_id = ?').get(accountId) as any;
        const nextSeq = (lastProp.max_seq || 0) + 1;

        const stmt = db.prepare(`
          INSERT INTO proposals (account_id, customer_id, sequential_number, title, total_value, proposal_date, followup_date, notes, public_link_uuid)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(accountId, customer_id, nextSeq, title, total_value, proposal_date, followup_date, notes, uuid);
        const proposalId = info.lastInsertRowid;

        const stmtItem = db.prepare(`
          INSERT INTO proposal_items (proposal_id, product_service_id, description, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        for (const item of items) {
          stmtItem.run(proposalId, item.product_service_id || null, item.description, item.quantity, item.unit_price, item.total_price);
        }
        return { id: proposalId, uuid, sequential_number: nextSeq };
      });

      const result = insertTx();
      res.json(result);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.put('/api/proposals/:id/status', requireAuth, (req: any, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE proposals SET status = ? WHERE id = ? AND account_id = ?').run(status, req.params.id, req.user.accountId);
      res.json({ success: true });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // ==========================================
  // API ROUTES: PUBLIC PROPOSAL
  // ==========================================
  app.get('/api/public/proposals/:uuid', (req, res) => {
    try {
      const proposal = db.prepare(`
        SELECT p.*, c.name as customer_name, a.company_name 
        FROM proposals p 
        JOIN customers c ON p.customer_id = c.id 
        JOIN accounts a ON p.account_id = a.id
        WHERE p.public_link_uuid = ?
      `).get(req.params.uuid) as any;

      if (!proposal) return res.status(404).json({ error: 'Proposta não encontrada' });

      const items = db.prepare('SELECT * FROM proposal_items WHERE proposal_id = ?').all(proposal.id);
      res.json({ ...proposal, items });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.post('/api/public/proposals/:uuid/status', (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status inválido' });

    try {
      const info = db.prepare('UPDATE proposals SET status = ? WHERE public_link_uuid = ?').run(status, req.params.uuid);
      if (info.changes === 0) return res.status(404).json({ error: 'Proposta não encontrada' });
      res.json({ success: true });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // ==========================================
  // API ROUTES: SETTINGS
  // ==========================================
  app.get('/api/settings', requireAuth, (req: any, res) => {
    try {
      let settings = db.prepare('SELECT * FROM settings WHERE account_id = ?').get(req.user.accountId) as any;
      if (!settings) {
        db.prepare('INSERT INTO settings (account_id, whatsapp_default_text) VALUES (?, ?)').run(req.user.accountId, 'Olá #CLIENTE#, segue o link da proposta #PROPOSTA# no valor de #VALOR#: #LINK#');
        settings = db.prepare('SELECT * FROM settings WHERE account_id = ?').get(req.user.accountId);
      }
      res.json(settings);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.put('/api/settings', requireAuth, (req: any, res) => {
    const { whatsapp_default_text } = req.body;
    try {
      db.prepare('UPDATE settings SET whatsapp_default_text = ? WHERE account_id = ?').run(whatsapp_default_text, req.user.accountId);
      res.json({ success: true });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  // ==========================================
  // VITE MIDDLEWARE (Frontend)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
