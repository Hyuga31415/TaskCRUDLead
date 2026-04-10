package com.example.ModuleLead.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class LeadRequestDTO {

    @NotBlank(message = "Tên liên hệ không được để trống")
    private String contactName;

    private String companyName;

    @Pattern(regexp = "^(84|0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Email(message = "Email không đúng định dạng")
    private String email;

    @Pattern(regexp = "^[0-9]{10}(-[0-9]{3})?$", message = "Mã số thuế không hợp lệ (10 hoặc 13 số)")
    private String taxCode;

    @Pattern(regexp = "^[0-9]{12}$", message = "CCCD/CMND phải bao gồm 12 chữ số")
    private String citizenId;

    private String address;
    private String website;
    private Integer provinceId;
    private String description;
    private BigDecimal expectedRevenue;

    // Các trường mới thêm theo schema
    private Long statusId;
    private Long sourceId;
    private Long campaignId;
    private Long organizationId;
    private Long assignedTo;

    // Danh sách ID sản phẩm quan tâm (Multi-select dropdown)
    private Set<Long> productInterestIds;
}