import { BookingModel, IBooking } from "../models/booking.model";

export interface IBookingRepository {
  createBooking(data: Partial<IBooking>): Promise<IBooking>;
  getBookingById(id: string): Promise<IBooking | null>;
  getBookingsByUser(userId: string): Promise<IBooking[]>;
}

export class BookingMongoRepository implements IBookingRepository {
  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    const created = await BookingModel.create(data);
    return created;
  }

  async getBookingById(id: string): Promise<IBooking | null> {
    return BookingModel.findById(id).exec();
  }

  async getBookingsByUser(userId: string): Promise<IBooking[]> {
    return BookingModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }
}
