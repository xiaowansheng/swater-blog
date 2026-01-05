package com.blog.modules.statistics.statistics.model.dto;



import com.blog.shared.model.dto.BaseDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
@Data
@EqualsAndHashCode(callSuper = true)
public class VisitStatisticsQueryDTO extends com.blog.shared.model.dto.BaseDTO {
    private String pageType;

    private String pageId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}

