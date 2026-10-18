/**
 * @file apps/api/controllers/support.controller.js
 * @description Support and Grievance Redressal controller handling tickets, contact enquiries, and FAQs
 */

import SupportTicket from '../models/SupportTicket.js';
import FAQ from '../models/FAQ.js';
import { ApiError, asyncHandler } from '../middleware/error.middleware.js';

export const createSupportTicket = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, category, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw ApiError.badRequest('Name, email, subject, and message are required');
  }

  const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const ticket = await SupportTicket.create({
    ticketId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    subject: subject.trim(),
    category: category || 'general_enquiry',
    message: message.trim(),
    status: 'open'
  });

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been submitted successfully. A grievance officer will review it shortly.',
    data: {
      ticketId: ticket.ticketId,
      status: ticket.status,
      category: ticket.category,
      createdAt: ticket.createdAt
    }
  });
});

export const getTicketStatus = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) {
    throw ApiError.notFound(`Ticket #${ticketId} was not found in our records`);
  }

  res.status(200).json({
    success: true,
    data: {
      ticketId: ticket.ticketId,
      name: ticket.name,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      resolutionNote: ticket.resolutionNote,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    }
  });
});

export const getAllTickets = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;

  const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tickets
  });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { status, resolutionNote, priority } = req.body;

  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) {
    throw ApiError.notFound('Ticket not found');
  }

  if (status) ticket.status = status;
  if (resolutionNote !== undefined) ticket.resolutionNote = resolutionNote;
  if (priority) ticket.priority = priority;

  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket updated successfully',
    data: ticket
  });
});

export const getFAQs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;

  let faqs = await FAQ.find(filter).sort({ sortOrder: 1, createdAt: 1 });

  // Default fallback FAQs if not yet seeded
  if (faqs.length === 0) {
    faqs = [
      {
        question: 'How do I post a classified ad on MyBigBazaar?',
        answer: 'Tap "Post Ad", select your category, upload authentic photos of your item, enter price and location details, and submit for instant live publishing.',
        category: 'classifieds'
      },
      {
        question: 'Are doorstep service technicians verified?',
        answer: 'Yes. Every service partner undergoes rigorous government ID KYC verification (Aadhaar/PAN/trade licenses) and background checks before they can accept customer bookings.',
        category: 'services'
      },
      {
        question: 'How does escrow protection work for service bookings?',
        answer: 'Your payment is safely held in escrow until the service technician completes the job and you provide the 4-digit verification completion OTP.',
        category: 'payments'
      },
      {
        question: 'How do I lodge a grievance under IT Rules 2021?',
        answer: 'Submit an inquiry with the category "Grievance" or email grievance@mybigbazaar.com directly. Our designated Grievance Officer acknowledges requests within 24 hours.',
        category: 'safety'
      }
    ];
  }

  res.status(200).json({
    success: true,
    data: faqs
  });
});

export default {
  createSupportTicket,
  getTicketStatus,
  getAllTickets,
  updateTicket,
  getFAQs
};
