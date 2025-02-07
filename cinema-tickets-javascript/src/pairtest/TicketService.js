import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  TICKET_PRICES = {
    'INFANT' : 0,
    'CHILD' : 15,
    'ADULT' : 25 ,
  };

  purchaseTickets(accountId, ...ticketTypeRequests) {
    const ticketTypeRequestObj = ticketTypeRequests[0];
    const paymentService = new TicketPaymentService();

    paymentService.makePayment(accountId, this.calculatePrice(ticketTypeRequestObj));
  }

  calculatePrice(ticketTypeRequests) {

    let totalPrice = 0;
    ticketTypeRequests.forEach(ticket => {
      totalPrice += ticket.getNoOfTickets() * this.TICKET_PRICES[ticket.getTicketType()];
    })
    return totalPrice;
  }
}
