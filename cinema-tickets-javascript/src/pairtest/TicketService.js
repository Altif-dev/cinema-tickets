import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    const ticketTypeRequestObj = ticketTypeRequests[0];
    const paymentService = new TicketPaymentService();

    paymentService.makePayment(accountId, this.calculatePrice(ticketTypeRequestObj));
  }

  calculatePrice(ticketTypeRequests) {
    return ticketTypeRequests[0].getNoOfTickets() * 25;
  }
}
