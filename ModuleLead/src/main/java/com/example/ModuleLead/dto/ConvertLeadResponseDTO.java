package com.example.ModuleLead.dto;

import lombok.Data;

@Data
public class ConvertLeadResponseDTO {
    private String message;
    private Long customerId;
    private Long contactId;
    private Long opportunityId;
}