package com.blog.modules.statistics.track.controller.admin;


import com.blog.modules.statistics.track.model.vo.AdminStatisticsOverviewVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTopPageVO;
import com.blog.modules.statistics.track.model.vo.AdminStatisticsTrendVO;
import com.blog.modules.statistics.track.service.AdminStatisticsService;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("admin/statistics")
@ApiOperation(name = "统计", description = "统计后台接口", open = false)
public class AdminStatisticsController {
    @Autowired
    private AdminStatisticsService adminStatisticsService;

    @GetMapping("/overview")
    @ApiOperation(name = "统计总览", type = ApiOperationType.QUERY, description = "获取时间范围内 UV/PV/会话数等总览指标")
    public Result<AdminStatisticsOverviewVO> overview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return Result.success(adminStatisticsService.overview(start, end));
    }

    @GetMapping("/trend/daily")
    @ApiOperation(name = "趋势（按天）", type = ApiOperationType.QUERY, description = "获取指标按天趋势")
    public Result<AdminStatisticsTrendVO> dailyTrend(
            @RequestParam String metric,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return Result.success(adminStatisticsService.dailyTrend(metric, start, end));
    }

    @GetMapping("/pages/top")
    @ApiOperation(name = "Top 页面", type = ApiOperationType.QUERY, description = "获取时间范围内 Top 页面")
    public Result<List<AdminStatisticsTopPageVO>> topPages(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String orderBy
    ) {
        return Result.success(adminStatisticsService.topPages(start, end, limit, orderBy));
    }
}

