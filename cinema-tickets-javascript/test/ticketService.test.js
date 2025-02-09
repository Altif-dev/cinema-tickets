import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";

import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";

import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService.js";

jest.mock('../src/thirdparty/paymentgateway/TicketPaymentService.js');
jest.mock('../src/thirdparty/seatbooking/SeatReservationService.js');

describe('Ticket service tests', () => {

    const makePaymentMock = jest.fn();
    TicketPaymentService.mockImplementation(() => {
        return {
            makePayment: makePaymentMock,
        };
    });

    const reserveSeatMock = jest.fn();
    SeatReservationService.mockImplementation(() => {
        return {
            reserveSeat: reserveSeatMock,
        };
    });

    let ticketService;
    beforeEach(() => {
        ticketService = new TicketService();
        makePaymentMock.mockClear();
    });

    describe('Calling payment service with the correct price', () => {
        it('should make a call to the payment service', () => {

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

    describe('calling seat reservation service with the correct number of seats', () => {
        it('should call seat reservation service', () => {

            ticketService.purchaseTickets(1, [new TicketTypeRequest('ADULT', 1)]);

            expect(reserveSeatMock).toHaveBeenCalled();
        });

        it.each([[23, 2, 2], [13, 1, 1], [36, 3, 3]])
        ('should make a call to the seat reservation service with the correct number of seats required for a single ticket type',
            (accountId, noOfTickets, seatsRequired) => {

                ticketService.purchaseTickets(accountId, [new TicketTypeRequest('ADULT', noOfTickets)]);

                expect(reserveSeatMock).toHaveBeenCalledWith(accountId, seatsRequired);
            });

        it('should make a call to the seat reservation service with the correct number of seats required for child and adult ticket types', () => {
            const ticketRequest = [
                new TicketTypeRequest('CHILD', 1),
                new TicketTypeRequest('ADULT', 2),
            ];

            ticketService.purchaseTickets(54, ticketRequest);

            expect(reserveSeatMock).toHaveBeenCalledWith(54, 3);
        });

        const ticketRequest1 = [
            new TicketTypeRequest('CHILD', 1),
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('INFANT', 2),
        ];

        const ticketRequest2 = [
            new TicketTypeRequest('CHILD', 1),
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('INFANT', 2),
            new TicketTypeRequest('CHILD', 1),
        ];

        it.each([[ticketRequest1, 3, 54],[ticketRequest2, 4, 67]])
        ('should make a call to the seat reservation service with the correct number of seats required for all ticket without allocating a seat for infant ticket',
            (ticketRequest, expected, accountId) => {

                ticketService.purchaseTickets(accountId, ticketRequest);

                expect(reserveSeatMock).toHaveBeenCalledWith(accountId, expected);
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

        it.each([[0], [-1], [-1000]])('should throw an error if the accountId is less than 1', (accountId) => {
            const ticketRequest = [
                new TicketTypeRequest('ADULT', 1),
            ];

            expect(() => {
                ticketService.purchaseTickets(accountId, ticketRequest)
            }).toThrow(new InvalidPurchaseException('RangeError: AccountId cannot be less than 1'));
        });

        it('should throw an error if number of tickets requested is less than 1 for a single ticket type', () => {
            const ticketRequest = [
                new TicketTypeRequest('ADULT', -1),
            ];

            expect(() => {
                ticketService.purchaseTickets(23, ticketRequest)
            }).toThrow(new InvalidPurchaseException('RangeError: number of tickets requested is less than 1'));
        });

        it('should throw an error if number of tickets requested is less than 1 when multiple ticket types requested', () => {
            const ticketRequest = [
                new TicketTypeRequest('ADULT', -1),
                new TicketTypeRequest('CHILD', 2),
            ];

            expect(() => {
                ticketService.purchaseTickets(23, ticketRequest)
            }).toThrow(new InvalidPurchaseException('RangeError: number of tickets requested is less than 1'));
        });
    });
});