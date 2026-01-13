package com.blog.modules.statistics.track.controller.pub;

import com.blog.modules.statistics.track.mapper.TrackStatisticsMapper;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/statistics")
@ApiOperation(name = "公开统计", description = "公开统计接口", open = true)
public class StatisticsPublicController {

    @Autowired
    private TrackStatisticsMapper trackStatisticsMapper;

    @GetMapping("/total")
    @ApiOperation(name = "总访问量", type = ApiOperationType.QUERY, description = "获取网站总访问量(PV/UV)")
    public Result<Map<String, Long>> getTotalVisits() {
        Map<String, Long> result = new HashMap<>();
        result.put("pv", trackStatisticsMapper.countTotalPv());
        result.put("uv", trackStatisticsMapper.countTotalUv());
        return Result.success(result);
    }
}
