package com.example.ModuleLead.services;

import com.example.ModuleLead.dto.ConvertLeadResponseDTO;
import com.example.ModuleLead.dto.LeadRequestDTO;
import com.example.ModuleLead.entities.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LeadService {
    Lead createLead(LeadRequestDTO dto);
    Lead getLeadById(Long id);
    List<Lead> getAllLeads();
    Lead updateLead(Long id, LeadRequestDTO dto);
    void deleteLead(Long id);

    // API lọc nâng cao có phân trang
    Page<Lead> searchLeads(String keyword, Long statusId, Integer provinceId,
                           Long sourceId, Long campaignId, Long assignedTo,
                           Long organizationId, Pageable pageable);
    // API Chuyển đổi Lead thành Customer
    ConvertLeadResponseDTO convertLeadToCustomer(Long leadId, Long userId);
}