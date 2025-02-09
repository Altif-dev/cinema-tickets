import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  TICKET_PRICES = {
    'INFANT' : 0,
    'CHILD' : 15,
    'ADULT' : 25,
  };

  /**
   * Calls the payment service and seat reservation service with correct price and seats to reserve
   * @param {number} accountId - accountId for the account that is making the purchase
   * @param {array} ticketTypeRequests - Requested tickets as an array of ticketType request objects
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    const ticketTypeRequestObj = ticketTypeRequests[0];
    try {
      this.#validateTicketRequest(ticketTypeRequestObj, accountId);

      const paymentService = new TicketPaymentService();
      paymentService.makePayment(accountId, this.#calculateTotalPrice(ticketTypeRequestObj));

      const seatReservationService = new SeatReservationService();
      seatReservationService.reserveSeat(accountId, this.#calculateSeatsRequired(ticketTypeRequestObj));

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
   * Calculates seats required for a given set of ticket types requests
   * @param {array} ticketTypeRequests - Array of ticketTypeRequest objects
   * @returns {number} number of seats required
   */
  #calculateSeatsRequired(ticketTypeRequests) {
    return ticketTypeRequests.reduce((currentValue, ticket) =>
        currentValue + ticket.getNoOfTickets() , 0);
  }

  /**
   * Validates a given set of ticket type requests
   * @param {array} ticketTypeRequestObj
   * @param {number} accountId
   */
  #validateTicketRequest(ticketTypeRequestObj, accountId) {
    const totalNoOfTicketsRequested = ticketTypeRequestObj.reduce((currentValue, ticket) =>
        currentValue + parseInt(ticket.getNoOfTickets()), 0);

    if (totalNoOfTicketsRequested > 25 ) {
      throw new RangeError('You can only purchase between 1 and 25 tickets per transaction');
    }

    const isNoOfTicketsRequestedLessThan1 = ticket => ticket.getNoOfTickets() < 1;

    if (ticketTypeRequestObj.some(isNoOfTicketsRequestedLessThan1)) {
      throw new RangeError('number of tickets requested is less than 1');
    }

    const checkIfAdultTicket = ticket => ticket.getTicketType() === 'ADULT';

    if (!ticketTypeRequestObj.some(checkIfAdultTicket)) {
      throw new Error('An adult ticket must purchased with a child or infant ticket');
    }

    if (accountId < 1) {
      throw new RangeError('AccountId cannot be less than 1');
    }
  }
}
