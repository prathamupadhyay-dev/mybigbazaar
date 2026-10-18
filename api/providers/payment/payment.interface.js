/**
 * @file apps/api/providers/payment/payment.interface.js
 * @description Standard payment gateway interface contract
 */

export class IPaymentProvider {
  /**
   * Create an order or payment session
   * @param {Object} params
   * @param {number} params.amount
   * @param {string} params.currency
   * @param {string} params.referenceId
   * @param {string} params.purpose
   * @param {string} params.userId
   * @param {string} [params.idempotencyKey]
   * @returns {Promise<{ gatewayOrderId: string, transactionId: string, status: string }>}
   */
  async createPaymentOrder(params) {
    throw new Error('createPaymentOrder must be implemented');
  }

  /**
   * Verify and complete payment
   */
  async verifyPayment(params) {
    throw new Error('verifyPayment must be implemented');
  }

  /**
   * Process refund
   */
  async processRefund(params) {
    throw new Error('processRefund must be implemented');
  }

  /**
   * Process incoming webhook event
   */
  async handleWebhook(event, payload, signature) {
    throw new Error('handleWebhook must be implemented');
  }
}
