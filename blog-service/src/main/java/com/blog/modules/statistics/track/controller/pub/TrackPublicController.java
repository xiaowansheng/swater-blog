package com.blog.modules.statistics.track.controller.pub;


import com.blog.modules.statistics.track.model.dto.TrackEnterDTO;
import com.blog.modules.statistics.track.model.vo.TrackEnterResultVO;
import com.blog.modules.statistics.track.service.TrackService;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.Result;
import com.blog.shared.annotation.ApiOperation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/track")
@ApiOperation(name = "访问追踪（V2）", description = "访客/会话/页面PV/内容阅读统计（V2）", open = true)
public class TrackPublicController {
    @Autowired
    private TrackService trackService;

    @PostMapping("/enter")
    @ApiOperation(name = "页面进入上报", type = ApiOperationType.CREATE, description = "统一入口：识别访客、判定会话、去重页面PV、去重内容阅读")
    public Result<TrackEnterResultVO> enter(@RequestBody TrackEnterDTO dto, HttpServletRequest request) {
        TrackEnterResultVO vo = trackService.enter(dto, request);
        return Result.success(vo);
    }
}

