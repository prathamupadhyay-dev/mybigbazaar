/**
 * @file apps/api/providers/sms/mock.sms.js
 * @description Local mock SMS and OTP provider
 */

export class MockSmsProvider {
  async sendOtp(phoneNumber, otp) {
    console.log(`[MOCK_SMS] 📱 To: ${phoneNumber} | Code: [${otp}] (Expires in 10 minutes)`.cyan);
    return {
      success: true,
      messageId: `sms_mock_${Date.now()}`,
      recipient: phoneNumber
    };
  }

  async sendMessage(phoneNumber, message) {
    console.log(`[MOCK_SMS] 📱 To: ${phoneNumber} | Message: "${message}"`.cyan);
    return {
      success: true,
      messageId: `sms_mock_${Date.now()}`
    };
  }
}

export default new MockSmsProvider();
