package com.example.ModuleLead.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contact_name", nullable = false, length = 50)
    private String contactName;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(length = 10)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "tax_code", length = 13)
    private String taxCode;

    @Column(name = "citizen_id", length = 12)
    private String citizenId;

    // Sửa lại thành status_id để khớp với DB (sys_lead_statuses)
    @Column(name = "status_id", nullable = false)
    private Long statusId = 1L; // 1L mặc định là 'NEW' theo DB

    @Column(length = 150)
    private String address;

    @Column(length = 100)
    private String website;

    @Column(name = "province_id")
    private Integer provinceId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "expected_revenue")
    private BigDecimal expectedRevenue;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "is_converted")
    private Boolean isConverted = false;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // --- MAPPING QUAN HỆ NHIỀU - NHIỀU VỚI SẢN PHẨM ---
    // Sử dụng ElementCollection để ánh xạ bảng lead_product_interests
    // mà không cần tạo Entity Product phức tạp nếu chưa cần thiết.
    @ElementCollection
    @CollectionTable(name = "lead_product_interests", joinColumns = @JoinColumn(name = "lead_id"))
    @Column(name = "product_id")
    private Set<Long> productInterestIds = new HashSet<>();
}