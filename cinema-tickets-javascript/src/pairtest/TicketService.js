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


  /**
   * Calls the payment service
   * @param {number} accountId - accountId for the account that is making the purchase
   * @param {array} ticketTypeRequests - Requested tickets as an array of ticketType request objects
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    const ticketTypeRequestObj = ticketTypeRequests[0];

    let totalNoOfTicketsRequested = 0;
    ticketTypeRequestObj.forEach(ticket => {
      totalNoOfTicketsRequested += ticket.getNoOfTickets();
    })

    if (totalNoOfTicketsRequested > 25 ) {
      throw new InvalidPurchaseException('You can only purchase between 1 and 25 tickets per transaction')
    }

    const paymentService = new TicketPaymentService();

    paymentService.makePayment(accountId, this.#calculateTotalPrice(ticketTypeRequestObj));
  }

  /**
   * Calculates total price for a given set of ticket type requests
   * @param {array} ticketTypeRequests - Array of ticketTypeRequest objects
   * @returns {number} totalPrice
   */
  #calculateTotalPrice(ticketTypeRequests) {

    let totalPrice = 0;

    ticketTypeRequests.forEach(ticket => {
      totalPrice += ticket.getNoOfTickets() * this.TICKET_PRICES[ticket.getTicketType()];
    })
    return totalPrice;
  }
}
