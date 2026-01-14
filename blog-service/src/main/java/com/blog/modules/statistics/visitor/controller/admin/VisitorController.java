package com.blog.modules.statistics.visitor.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.statistics.visitor.model.vo.VisitorStatisticsVO;
import com.blog.modules.statistics.visitor.model.vo.VisitorVO;
import com.blog.modules.statistics.visitor.service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
@RestController
@RequestMapping("/admin/visitor")
@ApiOperation(name = "访客管理模块", description = "访客管理接口", open = false)
public class VisitorController {
    @Autowired
    private VisitorService visitorService;

    @GetMapping("/list")
    @ApiOperation(name = "查询访客列表", type = ApiOperationType.QUERY, description = "分页查询访客列表")
    public Result<PageResult<VisitorVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String keyword) {
        PageResult<VisitorVO> result = visitorService.list(page, size, keyword);
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
}
