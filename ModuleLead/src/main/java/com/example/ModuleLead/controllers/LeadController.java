package com.example.ModuleLead.controllers;

import com.example.ModuleLead.dto.ConvertLeadResponseDTO;
import com.example.ModuleLead.dto.LeadRequestDTO;
import com.example.ModuleLead.entities.Lead;
import com.example.ModuleLead.services.LeadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leads")
@CrossOrigin(origins = "*")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    public ResponseEntity<Lead> createLead(@Valid @RequestBody LeadRequestDTO leadRequest) {
        Lead createdLead = leadService.createLead(leadRequest);
        return new ResponseEntity<>(createdLead, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Lead>> getAllLeads() {
        List<Lead> leads = leadService.getAllLeads();
        return ResponseEntity.ok(leads);
    }

    /**
     * API Tìm kiếm và Lọc Nâng Cao (Advanced Filter)
     * TỐI ƯU: Thiết lập mặc định trả về trang 0, 10 bản ghi/trang, xếp theo ID giảm dần (mới nhất lên đầu)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Lead>> searchLeads(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) Integer provinceId,
            @RequestParam(required = false) Long sourceId,
            @RequestParam(required = false) Long campaignId,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(required = false) Long organizationId,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<Lead> leads = leadService.searchLeads(
                keyword, statusId, provinceId, sourceId, campaignId, assignedTo, organizationId, pageable);
        return ResponseEntity.ok(leads);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
        Lead lead = leadService.getLeadById(id);
        return ResponseEntity.ok(lead);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadRequestDTO leadRequest) {
        Lead updatedLead = leadService.updateLead(id, leadRequest);
        return ResponseEntity.ok(updatedLead);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API Chuyển đổi Lead thành Customer
     * Method: POST
     * URL: /api/v1/leads/{id}/convert
     */
    @PostMapping("/{id}/convert")
    public ResponseEntity<ConvertLeadResponseDTO> convertLeadToCustomer(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") Long userId) {

        // Trong thực tế, userId sẽ được lấy từ Context/Token xác thực (SecurityContextHolder).
        // Ở đây để đơn giản ta dùng RequestParam với giá trị mặc định là 1 (Admin).
        ConvertLeadResponseDTO response = leadService.convertLeadToCustomer(id, userId);
        return ResponseEntity.ok(response);
    }
}