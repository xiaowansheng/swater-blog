package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.VisitorStatisticsVO;
import com.blog.model.vo.VisitorVO;
import com.blog.service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/visitor")
@ApiResource(name = "访客管理接口")
public class VisitorController {
    @Autowired
    private VisitorService visitorService;

    @GetMapping("/list")
    public Result<PageResult<VisitorVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String keyword) {
        PageResult<VisitorVO> result = visitorService.list(page, size, keyword);
        return Result.success(result);
    }

    @GetMapping("/statistics")
    public Result<VisitorStatisticsVO> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        VisitorStatisticsVO statistics = visitorService.getStatistics(startDate, endDate);
        return Result.success(statistics);
    }
}

