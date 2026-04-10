package com.example.ModuleLead.services;

import com.example.ModuleLead.dto.ConvertLeadResponseDTO;
import com.example.ModuleLead.dto.LeadRequestDTO;
import com.example.ModuleLead.entities.Lead;
import com.example.ModuleLead.repositories.LeadRepository;
import com.example.ModuleLead.repositories.LeadSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Types;
import java.util.List;
import java.util.Map;

@Service
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;
    private final JdbcTemplate jdbcTemplate;

    public LeadServiceImpl(LeadRepository leadRepository, JdbcTemplate jdbcTemplate) {
        this.leadRepository = leadRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public Lead createLead(LeadRequestDTO dto) {
        // Trong hàm createLead và updateLead của LeadServiceImpl.java
        if (dto.getStatusId() != null && dto.getStatusId() == 3L) {
            throw new RuntimeException("Lỗi nghiệp vụ: Không thể thiết lập trạng thái 'Đã chuyển đổi' bằng tay. Vui lòng sử dụng tính năng Chuyển đổi (Convert).");
        }
        if (dto.getEmail() != null && leadRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }
        if (dto.getPhone() != null && leadRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại trong hệ thống");
        }

        Lead lead = Lead.builder()
                .contactName(dto.getContactName())
                .companyName(dto.getCompanyName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .taxCode(dto.getTaxCode())
                .citizenId(dto.getCitizenId())
                .address(dto.getAddress())
                .website(dto.getWebsite())
                .provinceId(dto.getProvinceId())
                .description(dto.getDescription())
                .expectedRevenue(dto.getExpectedRevenue())
                .statusId(dto.getStatusId() != null ? dto.getStatusId() : 1L)
                .sourceId(dto.getSourceId())
                .campaignId(dto.getCampaignId())
                .organizationId(dto.getOrganizationId())
                .assignedTo(dto.getAssignedTo())
                .productInterestIds(dto.getProductInterestIds()) // Tự động lưu vào bảng mapping
                .isConverted(false)
                .build();

        return leadRepository.save(lead);
    }

    @Override
    public Lead getLeadById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lead với ID: " + id));
    }

    @Override
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    @Override
    @Transactional
    public Lead updateLead(Long id, LeadRequestDTO dto) {
        // Trong hàm createLead và updateLead của LeadServiceImpl.java
        if (dto.getStatusId() != null && dto.getStatusId() == 3L) {
            throw new RuntimeException("Lỗi nghiệp vụ: Không thể thiết lập trạng thái 'Đã chuyển đổi' bằng tay. Vui lòng sử dụng tính năng Chuyển đổi (Convert).");
        }
        Lead existingLead = getLeadById(id);

        existingLead.setContactName(dto.getContactName());
        existingLead.setCompanyName(dto.getCompanyName());
        existingLead.setPhone(dto.getPhone());
        existingLead.setEmail(dto.getEmail());
        existingLead.setTaxCode(dto.getTaxCode());
        existingLead.setCitizenId(dto.getCitizenId());
        existingLead.setAddress(dto.getAddress());
        existingLead.setWebsite(dto.getWebsite());
        existingLead.setProvinceId(dto.getProvinceId());
        existingLead.setDescription(dto.getDescription());
        existingLead.setExpectedRevenue(dto.getExpectedRevenue());

        existingLead.setSourceId(dto.getSourceId());
        existingLead.setCampaignId(dto.getCampaignId());
        existingLead.setOrganizationId(dto.getOrganizationId());
        existingLead.setAssignedTo(dto.getAssignedTo());

        if (dto.getStatusId() != null) {
            existingLead.setStatusId(dto.getStatusId());
        }

        if(dto.getProductInterestIds() != null) {
            existingLead.setProductInterestIds(dto.getProductInterestIds());
        }

        return leadRepository.save(existingLead);
    }

    @Override
    @Transactional
    public void deleteLead(Long id) {
        Lead lead = getLeadById(id);
        leadRepository.delete(lead);
    }

    @Override
    public Page<Lead> searchLeads(String keyword, Long statusId, Integer provinceId,
                                  Long sourceId, Long campaignId, Long assignedTo,
                                  Long organizationId, Pageable pageable) {

        Specification<Lead> spec = LeadSpecification.filterLeads(
                keyword, statusId, provinceId, sourceId, campaignId, assignedTo, organizationId);

        return leadRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public ConvertLeadResponseDTO convertLeadToCustomer(Long leadId, Long userId) {
        // 1. Kiểm tra Lead có tồn tại và đã chuyển đổi chưa
        Lead lead = getLeadById(leadId);
        if (Boolean.TRUE.equals(lead.getIsConverted())) {
            throw new RuntimeException("Lead này đã được chuyển đổi trước đó!");
        }

        try {
            // 2. CẤU HÌNH LẠI SimpleJdbcCall ĐỂ TRÁNH LỖI TRÙNG LẶP METADATA
            SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                    .withCatalogName("db_crm") // Chỉ định đích danh Database của bạn
                    .withProcedureName("sp_ConvertLeadToCustomer")
                    .withoutProcedureColumnMetaDataAccess() // TẮT tự động quét metadata
                    .declareParameters(
                            // Khai báo rõ ràng các tham số IN
                            new SqlParameter("p_lead_id", Types.BIGINT),
                            new SqlParameter("p_user_id", Types.BIGINT),
                            // Khai báo rõ ràng các tham số OUT
                            new SqlOutParameter("p_customer_id", Types.BIGINT),
                            new SqlOutParameter("p_contact_id", Types.BIGINT),
                            new SqlOutParameter("p_opportunity_id", Types.BIGINT)
                    );

            SqlParameterSource inParams = new MapSqlParameterSource()
                    .addValue("p_lead_id", leadId)
                    .addValue("p_user_id", userId);

            // Thực thi Procedure
            Map<String, Object> outParams = jdbcCall.execute(inParams);

            // 3. Mapping kết quả OUT vào DTO
            ConvertLeadResponseDTO response = new ConvertLeadResponseDTO();
            response.setMessage("Chuyển đổi Lead thành Customer thành công!");

            if (outParams.get("p_customer_id") != null) {
                response.setCustomerId(((Number) outParams.get("p_customer_id")).longValue());
            }
            if (outParams.get("p_contact_id") != null) {
                response.setContactId(((Number) outParams.get("p_contact_id")).longValue());
            }
            if (outParams.get("p_opportunity_id") != null) {
                response.setOpportunityId(((Number) outParams.get("p_opportunity_id")).longValue());
            }

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi thủ tục chuyển đổi: " + e.getMessage());
        }
    }
}