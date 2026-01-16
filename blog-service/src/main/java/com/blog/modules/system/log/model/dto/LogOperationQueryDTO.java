package com.blog.modules.system.log.model.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

@Data
public class LogOperationQueryDTO {
    private Long page;
    private Long size;
    private Long userId;
    private String module;
    private String type;
    private String keyword;
    private String requestMethod;
    private String requestUri;
    private String username;
    private String ip;
    private Integer status;
    private String device;
    private String browser;
    private String ipSource;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;
}
