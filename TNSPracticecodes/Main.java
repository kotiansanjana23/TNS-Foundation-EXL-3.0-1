import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // TicketBooking input
        String[] details = sc.nextLine().split(",");
        TicketBooking booking = new TicketBooking(details[0], details[1], Integer.parseInt(details[2]));

        int paymentMode = Integer.parseInt(sc.nextLine());

        switch (paymentMode) {
            case 1: // Cash
                double cashAmount = sc.nextDouble();
                printBookingDetails(booking);
                booking.makePayment(cashAmount);
                break;

            case 2: // Wallet
                double walletAmount = sc.nextDouble();
                String walletNum = sc.next();
                printBookingDetails(booking);
                booking.makePayment(walletNum, walletAmount);
                break;

            case 3: // Credit card
                String holderName = sc.next();
                double cardAmount = sc.nextDouble();
                String cardType = sc.next();
                String ccv = sc.next();
                printBookingDetails(booking);
                booking.makePayment(cardType, ccv, holderName, cardAmount);
                break;

            default:
                System.out.println("Invalid choice");
        }
    }

    private static void printBookingDetails(TicketBooking booking) {
        System.out.println("Stage event:" + booking.getStageEvent());
        System.out.println("Customer:" + booking.getCustomer());
        System.out.println("Number of seats:" + booking.getNoOfSeats());
    }
}
