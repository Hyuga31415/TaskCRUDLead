package com.example.ModuleLead.controllers;

import com.example.ModuleLead.dto.DropdownDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/metadata")
@CrossOrigin(origins = "*")
public class MetadataController {

    private final JdbcTemplate jdbcTemplate;

    // Sử dụng JdbcTemplate để truy vấn trực tiếp SQL, cực kỳ nhẹ và nhanh
    // thay vì phải tạo Entity/Repository cồng kềnh cho các bảng tham chiếu.
    public MetadataController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/products")
    public List<DropdownDTO> getProducts() {
        // Chỉ lấy các sản phẩm/dịch vụ đang Active
        return jdbcTemplate.query("SELECT id, name FROM products WHERE is_active = 1",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }

    @GetMapping("/sources")
    public List<DropdownDTO> getSources() {
        return jdbcTemplate.query("SELECT id, name FROM sys_lead_sources",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }

    @GetMapping("/campaigns")
    public List<DropdownDTO> getCampaigns() {
        return jdbcTemplate.query("SELECT id, name FROM campaigns",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }

    @GetMapping("/users")
    public List<DropdownDTO> getUsers() {
        // Lấy danh sách nhân viên đang Active, ánh xạ full_name thành name
        return jdbcTemplate.query("SELECT id, full_name as name FROM users WHERE status = 'ACTIVE'",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }

    @GetMapping("/organizations")
    public List<DropdownDTO> getOrganizations() {
        return jdbcTemplate.query("SELECT id, name FROM organizations",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }

    @GetMapping("/provinces")
    public List<DropdownDTO> getProvinces() {
        return jdbcTemplate.query("SELECT id, name FROM provinces",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }

    @GetMapping("/status")
    public List<DropdownDTO> getStatus() {
        return jdbcTemplate.query("SELECT id, name FROM sys_lead_statuses",
                (rs, rowNum) -> new DropdownDTO(rs.getLong("id"), rs.getString("name")));
    }
}