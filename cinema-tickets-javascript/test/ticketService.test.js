import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";

import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";
jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService.js');

describe('Ticket service tests', () => {

    const makePaymentMock = jest.fn();
    TicketPaymentService.mockImplementation(() => {
        return {
            makePayment: makePaymentMock,
        };
    });

    it('should make a call to the payment service', () => {
        //arrange
        const ticketService = new TicketService();
        //act
        ticketService.purchaseTickets(1, [new TicketTypeRequest('ADULT', 1)]);
        //assert
        expect(makePaymentMock).toHaveBeenCalled();

    });

    it.each([[11, 1, 20],[34, 2, 40 ]])('should make a call to the payment service with the correct ticket price for a single ticket',
        (accountId, noOfTickets, expectedCost) => {

        const ticketService = new TicketService();

        ticketService.purchaseTickets(accountId, [new TicketTypeRequest('ADULT', noOfTickets)]);

        expect(makePaymentMock).toHaveBeenCalledWith(accountId, expectedCost);
    })
});