package com.blog.model.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class VisitStatisticsQueryDTO extends BaseDTO {
    private String pageType;

    private String pageId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}


