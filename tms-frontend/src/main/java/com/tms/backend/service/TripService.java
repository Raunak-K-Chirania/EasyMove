package com.tms.backend.service;

import com.tms.backend.entity.Booking;
import com.tms.backend.entity.Trip;
import com.tms.backend.repository.BookingRepository;
import com.tms.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripService {
    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip createTrip(Trip trip) {
        // Automatically link and update booking status
        Booking booking = bookingRepository.findById(trip.getBooking().getId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("CONFIRMED");
        bookingRepository.save(booking);

        trip.setBooking(booking);
        trip.setStatus("SCHEDULED");
        return tripRepository.save(trip);
    }

    public Trip updateTripStatus(Long id, String status) {
        Trip trip = tripRepository.findById(id).orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.setStatus(status);
        Trip savedTrip = tripRepository.save(trip);

        // Update booking status based on trip status
        Booking booking = trip.getBooking();
        if ("DELIVERED".equals(status)) {
            booking.setStatus("COMPLETED");
        } else if ("IN_TRANSIT".equals(status)) {
            // Keep booking CONFIRMED
        }
        bookingRepository.save(booking);

        return savedTrip;
    }
}
