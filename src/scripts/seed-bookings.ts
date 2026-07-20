import bcryptjs from "bcryptjs";
import { connectToMongoDB } from "../database/mongodb";
import { UserModel } from "../models/user.model";
import { BookingModel } from "../models/booking.model";

async function seedBookings() {
  await connectToMongoDB();

  const userEmail = process.env.SEED_USER_EMAIL || "dummyuser@example.com";
  const userPassword = process.env.SEED_USER_PASSWORD || "Password123";

  let user = await UserModel.findOne({ email: userEmail });

  if (!user) {
    const hashedPassword = await bcryptjs.hash(userPassword, 10);

    user = await UserModel.create({
      fullName: "Dummy Passenger",
      email: userEmail,
      contactNumber: "9801234567",
      gender: "male",
      password: hashedPassword,
      role: "user",
    });

    console.log(`Created seed user: ${userEmail} / ${userPassword}`);
  } else {
    console.log(`Seed user already exists: ${userEmail}`);
  }

  const bookings = [
    {
      user: user._id,
      origin: "Kathmandu",
      destination: "Pokhara",
      operatorName: "Swift Holidays",
      busName: "Sofa Deluxe AC",
      travelDate: "2026-10-24",
      departureTime: "07:00 AM",
      arrivalTime: "02:30 PM",
      selectedSeats: ["S1"],
      totalFare: 1200,
      paymentMethod: "Khalti Wallet",
      paymentStatus: "paid",
      status: "confirmed",
      bookingReference: `BK-${Date.now()}-001`,
      passengerDetails: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
      },
    },
    {
      user: user._id,
      origin: "Kathmandu",
      destination: "Pokhara",
      operatorName: "Jagadamba Travels",
      busName: "AC VIP",
      travelDate: "2026-10-24",
      departureTime: "08:30 AM",
      arrivalTime: "04:00 PM",
      selectedSeats: ["S1", "S2", "S3"],
      totalFare: 4500,
      paymentMethod: "Cash on Boarding",
      paymentStatus: "pending",
      status: "pending",
      bookingReference: `BK-${Date.now()}-002`,
      passengerDetails: {
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
      },
    },
  ];

  for (const booking of bookings) {
    const existing = await BookingModel.findOne({ bookingReference: booking.bookingReference });
    if (!existing) {
      await BookingModel.create(booking as any);
      console.log(`Created booking: ${booking.bookingReference}`);
    } else {
      console.log(`Booking already exists: ${booking.bookingReference}`);
    }
  }

  console.log("Booking seed completed.");
  process.exit(0);
}

seedBookings().catch((err) => {
  console.error(err);
  process.exit(1);
});
