package com.blog.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("visit_statistics")
public class VisitStatistics extends BaseEntity {
    @TableField("page_type")
    private String pageType;

    @TableField("page_id")
    private String pageId;

    @TableField("statistics_date")
    private LocalDateTime statisticsDate;

    @TableField("visit_count")
    private Long visitCount;

    @TableField("unique_visitor_count")
    private Long uniqueVisitorCount;

    @TableField("geo_statistics")
    private String geoStatistics;

    @TableField("device_statistics")
    private String deviceStatistics;

    @TableField("browser_statistics")
    private String browserStatistics;
}


