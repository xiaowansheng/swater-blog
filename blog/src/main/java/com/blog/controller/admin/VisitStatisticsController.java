package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
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
@ApiResource(name = "访问统计管理接口")
public class VisitStatisticsController {
    @Autowired
    private VisitStatisticsService visitStatisticsService;

    @GetMapping("/list")
    public Result<PageResult<VisitStatisticsVO>> list(VisitStatisticsQueryDTO queryDTO) {
        PageResult<VisitStatisticsVO> result = visitStatisticsService.list(queryDTO);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<VisitStatisticsVO> getById(@PathVariable Long id) {
        VisitStatisticsVO vo = visitStatisticsService.getById(id);
        return Result.success(vo);
    }

    @PostMapping("/aggregate")
    public Result<Void> aggregateStatistics(@RequestParam(required = false) LocalDateTime date) {
        if (date != null) {
            visitStatisticsService.aggregateStatistics(date);
        } else {
            visitStatisticsService.aggregateStatistics(LocalDateTime.now());
        }
        return Result.success();
    }

    @PostMapping("/aggregate/range")
    public Result<Void> aggregateStatisticsRange(@RequestParam LocalDateTime startDate, 
                                                   @RequestParam LocalDateTime endDate) {
        visitStatisticsService.aggregateStatistics(startDate, endDate);
        return Result.success();
    }
}

