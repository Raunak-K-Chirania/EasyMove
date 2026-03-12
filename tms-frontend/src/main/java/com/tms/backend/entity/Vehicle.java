package com.tms.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String registrationNumber;

    private String type;
    private Double capacity; // e.g., in tons
    private String status; // e.g., AVAILABLE, ON_TRIP, MAINTENANCE
}
