import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";

import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";

import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";

jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService.js');

describe('Ticket service tests', () => {

    const makePaymentMock = jest.fn();
    TicketPaymentService.mockImplementation(() => {
        return {
            makePayment: makePaymentMock,
        };
    });

    let ticketService;
    beforeEach(() => {
        ticketService = new TicketService();
        makePaymentMock.mockClear();
    });

    describe('Calling payment service with the correct price', () => {
        it('should make a call to the payment service', () => {

            const ticketService = new TicketService();

            ticketService.purchaseTickets(1, [new TicketTypeRequest('ADULT', 1)]);

            expect(makePaymentMock).toHaveBeenCalled();
        });

        it.each([[11, 1, 25], [34, 2, 50]])('should make a call to the payment service with the correct ticket price for a single ticket',
            (accountId, noOfTickets, expectedCost) => {

                ticketService.purchaseTickets(accountId, [new TicketTypeRequest('ADULT', noOfTickets)]);

                expect(makePaymentMock).toHaveBeenCalledWith(accountId, expectedCost);
            });

        const ticketRequest1 = [
            new TicketTypeRequest('ADULT', 1),
            new TicketTypeRequest('CHILD', 4),
            new TicketTypeRequest('INFANT', 1)
        ];

        const ticketRequest2 = [
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('CHILD', 3),
            new TicketTypeRequest('INFANT', 1)
        ];

        it.each([[ticketRequest1, 23, 85], [ticketRequest2, 15, 95]])
        ('should calculate correct ticket price for multiple ticket types in a single transaction',
            (ticketRequest, accountId, expected) => {

                ticketService.purchaseTickets(accountId, ticketRequest);

                expect(makePaymentMock).toHaveBeenCalledWith(accountId, expected);
            });
    });
    
    describe('Validation tests', () => {
        it('should throw an error if more than 25 tickets are requested', () => {
            const ticketRequest = [
                new TicketTypeRequest('CHILD', 16),
                new TicketTypeRequest('ADULT', 4),
                new TicketTypeRequest('INFANT', 6),
            ];
            expect(() => {
                ticketService.purchaseTickets(1, ticketRequest)
            }).toThrow(new InvalidPurchaseException('RangeError: You can only purchase between 1 and 25 tickets per transaction'));
        });

        it('should throw an error if child or infant tickets are requested without an adult ticket', () => {
            const ticketRequest = [
                new TicketTypeRequest('CHILD', 2),
                new TicketTypeRequest('INFANT', 1),
            ];
            expect(() => {
                ticketService.purchaseTickets(3, ticketRequest)
            }).toThrow(new InvalidPurchaseException('Error: An adult ticket must purchased with a child or infant ticket'));
        });
    });
});