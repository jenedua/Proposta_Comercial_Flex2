import express, {type NextFunction, type Request, type Response} from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {ProductType, ProposalStatus} from '../generated/prisma/client.js';
import db from './db.js';

const DEFAULT_WHATSAPP_TEXT =
  'Ola #CLIENTE#, segue o link da proposta #PROPOSTA# no valor de #VALOR#: #LINK#';
const JWT_SECRET = process.env.JWT_SECRET || 'flex-proposta-secret-key-2026';

type AuthTokenPayload = {
  userId: number;
  accountId: number;
  name: string;
  iat?: number;
  exp?: number;
};

type AuthedRequest = Request & {
  user: AuthTokenPayload;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDateOnly(value?: string | null) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

function requireDateOnly(value: string | undefined | null, label: string) {
  const parsed = parseDateOnly(value);
  if (!parsed) {
    throw new Error(`${label} invalida.`);
  }
  return parsed;
}

function formatDateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function formatTimestamp(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function normalizeProductType(value: string) {
  return value === ProductType.service ? ProductType.service : ProductType.product;
}

function serializeCustomer(customer: {
  id: number;
  accountId: number;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
}) {
  return {
    id: customer.id,
    account_id: customer.accountId,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    created_at: formatTimestamp(customer.createdAt),
  };
}

function serializeProduct(product: {
  id: number;
  accountId: number;
  type: ProductType;
  description: string;
  price: number;
  createdAt: Date;
}) {
  return {
    id: product.id,
    account_id: product.accountId,
    type: product.type,
    description: product.description,
    price: product.price,
    created_at: formatTimestamp(product.createdAt),
  };
}

function serializeProposalItem(item: {
  id: number;
  proposalId: number;
  productServiceId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}) {
  return {
    id: item.id,
    proposal_id: item.proposalId,
    product_service_id: item.productServiceId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    created_at: formatTimestamp(item.createdAt),
  };
}

function serializeProposal(proposal: {
  id: number;
  accountId: number;
  customerId: number;
  sequentialNumber: number;
  title: string;
  totalValue: number;
  status: ProposalStatus;
  proposalDate: Date;
  followupDate: Date | null;
  notes: string | null;
  publicLinkUuid: string;
  createdAt: Date;
}) {
  return {
    id: proposal.id,
    account_id: proposal.accountId,
    customer_id: proposal.customerId,
    sequential_number: proposal.sequentialNumber,
    title: proposal.title,
    total_value: proposal.totalValue,
    status: proposal.status,
    proposal_date: formatDateOnly(proposal.proposalDate),
    followup_date: formatDateOnly(proposal.followupDate),
    notes: proposal.notes,
    public_link_uuid: proposal.publicLinkUuid,
    created_at: formatTimestamp(proposal.createdAt),
  };
}

function serializeSettings(settings: {
  id: number;
  accountId: number;
  whatsappDefaultText: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: settings.id,
    account_id: settings.accountId,
    whatsapp_default_text: settings.whatsappDefaultText,
    created_at: formatTimestamp(settings.createdAt),
    updated_at: formatTimestamp(settings.updatedAt),
  };
}

function monthKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function ensureSettings(accountId: number) {
  const existing = await db.settings.findUnique({where: {accountId}});
  if (existing) return existing;

  return db.settings.create({
    data: {
      accountId,
      whatsappDefaultText: DEFAULT_WHATSAPP_TEXT,
    },
  });
}

export function createApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/auth/register', async (req, res) => {
    const {company_name, name, email, whatsapp, password} = req.body;

    try {
      const existingUser = await db.user.findUnique({where: {email}});
      if (existingUser) {
        return res.status(400).json({error: 'E-mail ja cadastrado.'});
      }

      const hash = bcrypt.hashSync(password, 10);

      await db.$transaction(async (tx) => {
        const account = await tx.account.create({
          data: {
            companyName: company_name,
          },
        });

        await tx.user.create({
          data: {
            accountId: account.id,
            name,
            email,
            whatsapp: whatsapp || null,
            passwordHash: hash,
          },
        });

        await tx.settings.create({
          data: {
            accountId: account.id,
            whatsappDefaultText: DEFAULT_WHATSAPP_TEXT,
          },
        });
      });

      res.json({success: true});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const {email, password} = req.body;

    try {
      const user = await db.user.findUnique({where: {email}});

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({error: 'E-mail ou senha incorretos.'});
      }

      const token = jwt.sign(
        {userId: user.id, accountId: user.accountId, name: user.name},
        JWT_SECRET,
        {expiresIn: '7d'},
      );

      res.json({token, user: {name: user.name, email: user.email}});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({error: 'Nao autorizado'});

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      (req as AuthedRequest).user = decoded;
      next();
    } catch {
      res.status(401).json({error: 'Token invalido'});
    }
  };

  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;
    const accountId = authReq.user.accountId;

    try {
      const todayKey = new Date().toISOString().slice(0, 10);
      const today = requireDateOnly(todayKey, 'Data atual');
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const sixMonthsAgo = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1),
      );

      const [
        totalCustomers,
        totalProposals,
        approvedProposals,
        pendingProposals,
        approvedHistory,
        followUps,
      ] = await Promise.all([
        db.customer.count({where: {accountId}}),
        db.proposal.count({where: {accountId}}),
        db.proposal.count({where: {accountId, status: ProposalStatus.approved}}),
        db.proposal.count({
          where: {
            accountId,
            status: {in: [ProposalStatus.draft, ProposalStatus.sent]},
          },
        }),
        db.proposal.findMany({
          where: {
            accountId,
            status: ProposalStatus.approved,
            proposalDate: {gte: sixMonthsAgo},
          },
          select: {
            proposalDate: true,
            totalValue: true,
          },
        }),
        db.proposal.findMany({
          where: {
            accountId,
            followupDate: {
              gte: today,
              lt: tomorrow,
            },
            status: {
              notIn: [ProposalStatus.approved, ProposalStatus.rejected],
            },
          },
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {createdAt: 'desc'},
        }),
      ]);

      const chartAccumulator = new Map<string, number>();
      for (const item of approvedHistory) {
        const key = monthKey(item.proposalDate);
        chartAccumulator.set(key, (chartAccumulator.get(key) || 0) + item.totalValue);
      }

      const chartData = Array.from(chartAccumulator.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([month, total]) => ({month, total}));

      res.json({
        totalCustomers,
        totalProposals,
        approvedProposals,
        pendingProposals,
        chartData,
        followUps: followUps.map((proposal) => ({
          ...serializeProposal(proposal),
          customer_name: proposal.customer.name,
          customer_phone: proposal.customer.phone,
        })),
      });
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.get('/api/customers', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;

    try {
      const customers = await db.customer.findMany({
        where: {accountId: authReq.user.accountId},
        orderBy: {name: 'asc'},
      });
      res.json(customers.map(serializeCustomer));
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.post('/api/customers', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;
    const {name, email, phone} = req.body;

    try {
      const customer = await db.customer.create({
        data: {
          accountId: authReq.user.accountId,
          name,
          email: email || null,
          phone: phone || null,
        },
      });
      res.json(serializeCustomer(customer));
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.get('/api/products', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;

    try {
      const products = await db.productService.findMany({
        where: {accountId: authReq.user.accountId},
        orderBy: {description: 'asc'},
      });
      res.json(products.map(serializeProduct));
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.post('/api/products', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;
    const {type, description, price} = req.body;

    try {
      const product = await db.productService.create({
        data: {
          accountId: authReq.user.accountId,
          type: normalizeProductType(type),
          description,
          price: toNumber(price),
        },
      });
      res.json(serializeProduct(product));
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.get('/api/proposals', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;

    try {
      const proposals = await db.proposal.findMany({
        where: {accountId: authReq.user.accountId},
        include: {
          customer: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {createdAt: 'desc'},
      });

      res.json(
        proposals.map((proposal) => ({
          ...serializeProposal(proposal),
          customer_name: proposal.customer.name,
          customer_phone: proposal.customer.phone,
        })),
      );
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.post('/api/proposals', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;
    const {customer_id, title, total_value, proposal_date, followup_date, notes, items} =
      req.body;
    const accountId = authReq.user.accountId;
    const uuid = crypto.randomUUID();

    try {
      const result = await db.$transaction(async (tx) => {
        const lastProposal = await tx.proposal.findFirst({
          where: {accountId},
          orderBy: {sequentialNumber: 'desc'},
          select: {sequentialNumber: true},
        });

        const nextSeq = (lastProposal?.sequentialNumber || 0) + 1;

        const proposal = await tx.proposal.create({
          data: {
            accountId,
            customerId: Number(customer_id),
            sequentialNumber: nextSeq,
            title,
            totalValue: toNumber(total_value),
            proposalDate: requireDateOnly(proposal_date, 'Data da proposta'),
            followupDate: parseDateOnly(followup_date),
            notes: notes || null,
            publicLinkUuid: uuid,
            items: {
              create: (items || []).map((item: any) => ({
                productServiceId: item.product_service_id
                  ? Number(item.product_service_id)
                  : null,
                description: item.description,
                quantity: toNumber(item.quantity, 1),
                unitPrice: toNumber(item.unit_price),
                totalPrice: toNumber(item.total_price),
              })),
            },
          },
        });

        return {
          id: proposal.id,
          uuid,
          sequential_number: nextSeq,
        };
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.put('/api/proposals/:id/status', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;
    const {status} = req.body;

    try {
      await db.proposal.updateMany({
        where: {
          id: Number(req.params.id),
          accountId: authReq.user.accountId,
        },
        data: {status},
      });

      res.json({success: true});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.get('/api/public/proposals/:uuid', async (req, res) => {
    try {
      const proposal = await db.proposal.findUnique({
        where: {publicLinkUuid: req.params.uuid},
        include: {
          customer: {
            select: {
              name: true,
            },
          },
          account: {
            select: {
              companyName: true,
            },
          },
          items: {
            orderBy: {id: 'asc'},
          },
        },
      });

      if (!proposal) {
        return res.status(404).json({error: 'Proposta nao encontrada'});
      }

      res.json({
        ...serializeProposal(proposal),
        customer_name: proposal.customer.name,
        company_name: proposal.account.companyName,
        items: proposal.items.map(serializeProposalItem),
      });
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.post('/api/public/proposals/:uuid/status', async (req, res) => {
    const {status} = req.body;
    if (![ProposalStatus.approved, ProposalStatus.rejected].includes(status)) {
      return res.status(400).json({error: 'Status invalido'});
    }

    try {
      const result = await db.proposal.updateMany({
        where: {publicLinkUuid: req.params.uuid},
        data: {status},
      });

      if (result.count === 0) {
        return res.status(404).json({error: 'Proposta nao encontrada'});
      }

      res.json({success: true});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.get('/api/settings', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;

    try {
      const settings = await ensureSettings(authReq.user.accountId);
      res.json(serializeSettings(settings));
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  app.put('/api/settings', requireAuth, async (req, res) => {
    const authReq = req as AuthedRequest;
    const {whatsapp_default_text} = req.body;

    try {
      const settings = await db.settings.upsert({
        where: {accountId: authReq.user.accountId},
        update: {whatsappDefaultText: whatsapp_default_text},
        create: {
          accountId: authReq.user.accountId,
          whatsappDefaultText: whatsapp_default_text || DEFAULT_WHATSAPP_TEXT,
        },
      });

      res.json({success: true, settings: serializeSettings(settings)});
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  });

  return app;
}
