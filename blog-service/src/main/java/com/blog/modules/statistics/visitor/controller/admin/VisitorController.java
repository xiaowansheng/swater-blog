package com.blog.modules.statistics.visitor.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.statistics.visitor.model.vo.VisitorPageViewVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorTrackingDetailVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import com.blog.modules.statistics.visitor.service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
@RestController
@RequestMapping("/api/admin/visitor")
@ApiOperation(name = "访客管理模块", description = "访客管理接口", open = false)
public class VisitorController {
    @Autowired
    private VisitorService visitorService;

    @GetMapping("/list")
    @ApiOperation(name = "查询访客列表", type = ApiOperationType.QUERY, description = "分页查询访客列表，支持多条件筛选")
    public Result<PageResult<VisitorVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String ip,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String osName,
            @RequestParam(required = false) String browserName,
            @RequestParam(required = false) String trafficSource) {
        PageResult<VisitorVO> result = visitorService.list(page, size, ip, country, province, city, deviceType, osName, browserName, trafficSource);
        return Result.success(result);
    }

    @GetMapping("/statistics")
    @ApiOperation(name = "访客统计", type = ApiOperationType.QUERY, description = "获取访客统计数据")
    public Result<VisitorStatisticsVO> getStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        VisitorStatisticsVO statistics = visitorService.getStatistics(startDate, endDate);
        return Result.success(statistics);
    }

    @GetMapping("/tracking/{visitorId}")
    @ApiOperation(name = "访客访问轨迹", type = ApiOperationType.QUERY, description = "查询访客首访会话和最近会话列表")
    public Result<VisitorTrackingDetailVO> getTrackingDetail(
            @PathVariable Long visitorId,
            @RequestParam(required = false) Integer limit) {
        return Result.success(visitorService.getTrackingDetail(visitorId, limit));
    }

    @GetMapping("/tracking/{visitorId}/sessions/{sessionId}/pages")
    @ApiOperation(name = "访客会话页面路径", type = ApiOperationType.QUERY, description = "查询指定访客会话下的页面访问路径")
    public Result<List<VisitorPageViewVO>> getSessionPages(
            @PathVariable Long visitorId,
            @PathVariable String sessionId) {
        return Result.success(visitorService.getSessionPages(visitorId, sessionId));
    }
}
