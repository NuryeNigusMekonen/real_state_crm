package com.realestatecrm.repository;

import com.realestatecrm.entity.CommissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, UUID> {
}
