package com.example.ModuleLead.repositories;

import com.example.ModuleLead.entities.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
// Kế thừa thêm JpaSpecificationExecutor để hỗ trợ truy vấn động (Advanced Filter)
public interface LeadRepository extends JpaRepository<Lead, Long>, JpaSpecificationExecutor<Lead> {

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}