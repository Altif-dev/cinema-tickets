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
    try {
      this.#validateTicketRequest(ticketTypeRequestObj);

      const paymentService = new TicketPaymentService();
      paymentService.makePayment(accountId, this.#calculateTotalPrice(ticketTypeRequestObj));
    } catch (error) {
      throw new InvalidPurchaseException(`${error.name}: ${error.message}`);
    }
  }

  /**
   * Calculates total price for a given set of ticket type requests
   * @param {array} ticketTypeRequests - Array of ticketTypeRequest objects
   * @returns {number} totalPrice
   */
  #calculateTotalPrice(ticketTypeRequests) {
    return ticketTypeRequests.reduce((currentValue, ticket) =>
        currentValue + ticket.getNoOfTickets() * this.TICKET_PRICES[ticket.getTicketType()] , 0);
  }

  /**
   * Validates a given set of ticket type requests
   * @param {array} ticketTypeRequestObj
   */
  #validateTicketRequest(ticketTypeRequestObj) {
    const totalNoOfTicketsRequested = ticketTypeRequestObj.reduce((currentValue, ticket) =>
        currentValue + parseInt(ticket.getNoOfTickets()), 0);

    if (totalNoOfTicketsRequested > 25 ) {
      throw new RangeError('You can only purchase between 1 and 25 tickets per transaction');
    }

    const checkIfAdultTicket = ticket => ticket.getTicketType() === 'ADULT';

    if (!ticketTypeRequestObj.some(checkIfAdultTicket)) {
      throw new Error('An adult ticket must purchased with a child or infant ticket');
    }
  }
}
