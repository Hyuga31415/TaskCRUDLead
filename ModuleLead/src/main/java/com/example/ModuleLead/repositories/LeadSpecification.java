package com.example.ModuleLead.repositories;

import com.example.ModuleLead.entities.Lead;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class LeadSpecification {

    public static Specification<Lead> filterLeads(
            String keyword, Long statusId, Integer provinceId,
            Long sourceId, Long campaignId, Long assignedTo, Long organizationId) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Tìm kiếm Text (Tên, SĐT, Email)
            if (StringUtils.hasText(keyword)) {
                String likeKeyword = "%" + keyword.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("contactName")), likeKeyword);
                Predicate phonePredicate = criteriaBuilder.like(root.get("phone"), likeKeyword);
                Predicate emailPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), likeKeyword);

                predicates.add(criteriaBuilder.or(namePredicate, phonePredicate, emailPredicate));
            }

            // 2. Lọc theo các ID cụ thể
            if (statusId != null) predicates.add(criteriaBuilder.equal(root.get("statusId"), statusId));
            if (provinceId != null) predicates.add(criteriaBuilder.equal(root.get("provinceId"), provinceId));
            if (sourceId != null) predicates.add(criteriaBuilder.equal(root.get("sourceId"), sourceId));
            if (campaignId != null) predicates.add(criteriaBuilder.equal(root.get("campaignId"), campaignId));
            if (assignedTo != null) predicates.add(criteriaBuilder.equal(root.get("assignedTo"), assignedTo));
            if (organizationId != null) predicates.add(criteriaBuilder.equal(root.get("organizationId"), organizationId));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}