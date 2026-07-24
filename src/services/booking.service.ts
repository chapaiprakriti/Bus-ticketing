import { BookingMongoRepository } from "../repositories/booking.repository";
import { CreateBookingDTO } from "../dtos/booking.dto";
import { IBooking } from "../models/booking.model";
import { HttpException } from "../exceptions/http-exception";

const bookingRepository = new BookingMongoRepository();

export type PublicBooking = {
  id: string;
  origin: string;
  destination: string;
  operatorName: string;
  busName: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  selectedSeats: string[];
  totalFare: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  bookingReference: string;
  passengerDetails: {
    fullName: string;
    email: string;
    contactNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export class BookingService {
  private toPublicBooking(booking: IBooking): PublicBooking {
    return {
      id: booking._id.toString(),
      origin: booking.origin,
      destination: booking.destination,
      operatorName: booking.operatorName,
      busName: booking.busName,
      travelDate: booking.travelDate,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      selectedSeats: booking.selectedSeats,
      totalFare: booking.totalFare,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      bookingReference: booking.bookingReference,
      passengerDetails: booking.passengerDetails,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  async createBooking(
    userId: string,
    bookingData: CreateBookingDTO,
    passengerDetails: {
      fullName: string;
      email: string;
      contactNumber: string;
    }
  ): Promise<PublicBooking> {
    const bookingReference = `BK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const booking = await bookingRepository.createBooking({
      user: userId as any,
      origin: bookingData.origin,
      destination: bookingData.destination,
      operatorName: bookingData.operatorName,
      busName: bookingData.busName,
      travelDate: bookingData.travelDate,
      departureTime: bookingData.departureTime,
      arrivalTime: bookingData.arrivalTime,
      selectedSeats: bookingData.selectedSeats,
      totalFare: bookingData.totalFare,
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: bookingData.paymentStatus,
      status: bookingData.paymentStatus === "paid" ? "confirmed" : "pending",
      bookingReference,
      passengerDetails,
    });

    return this.toPublicBooking(booking);
  }

  async getBookingsByUser(userId: string): Promise<PublicBooking[]> {
    const bookings = await bookingRepository.getBookingsByUser(userId);
    return bookings.map((booking) => this.toPublicBooking(booking));
  }

  async getBookingById(userId: string, bookingId: string): Promise<PublicBooking> {
    const booking = await bookingRepository.getBookingById(bookingId);

    if (!booking) {
      throw new HttpException(404, "Booking not found");
    }

    if (booking.user.toString() !== userId) {
      throw new HttpException(403, "Forbidden");
    }

    return this.toPublicBooking(booking);
  }
}
