package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.VisitStatisticsQueryDTO;
import com.blog.model.vo.VisitStatisticsVO;
import com.blog.service.VisitStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/visit-statistics")
@ApiOperation(name = "访问统计模块", description = "访问统计管理接口", open = false)
public class VisitStatisticsController {
    @Autowired
    private VisitStatisticsService visitStatisticsService;

    @GetMapping("/list")
    @ApiOperation(name = "查询访问统计列表", type = ApiOperationType.QUERY, description = "分页查询访问统计")
    public Result<PageResult<VisitStatisticsVO>> list(VisitStatisticsQueryDTO queryDTO) {
        PageResult<VisitStatisticsVO> result = visitStatisticsService.list(queryDTO);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取访问统计详情", type = ApiOperationType.QUERY, description = "根据ID获取访问统计")
    public Result<VisitStatisticsVO> getById(@PathVariable Long id) {
        VisitStatisticsVO vo = visitStatisticsService.getById(id);
        return Result.success(vo);
    }

    @PostMapping("/aggregate")
    @ApiOperation(name = "聚合统计数据", type = ApiOperationType.OTHER, description = "聚合访问统计数据")
    public Result<Void> aggregateStatistics(@RequestParam(required = false) LocalDateTime date) {
        if (date != null) {
            visitStatisticsService.aggregateStatistics(date);
        } else {
            visitStatisticsService.aggregateStatistics(LocalDateTime.now());
        }
        return Result.success();
    }

    @PostMapping("/aggregate/range")
    @ApiOperation(name = "聚合范围统计数据", type = ApiOperationType.OTHER, description = "聚合指定时间范围的访问统计")
    public Result<Void> aggregateStatisticsRange(@RequestParam LocalDateTime startDate,
                                                   @RequestParam LocalDateTime endDate) {
        visitStatisticsService.aggregateStatistics(startDate, endDate);
        return Result.success();
    }
}
