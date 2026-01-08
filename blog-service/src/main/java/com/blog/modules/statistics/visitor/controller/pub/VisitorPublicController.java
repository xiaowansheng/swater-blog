package com.blog.modules.statistics.visitor.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.statistics.visitor.model.dto.VisitorAccessDTO;
import com.blog.modules.statistics.visitor.model.vo.VisitorAccessResultVO;
import com.blog.modules.statistics.visitor.service.VisitorService;
import com.blog.shared.util.RequestUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/visitor")
@ApiOperation(name = "访客访问上报", description = "记录前台访客访问", open = true)
public class VisitorPublicController {
    @Autowired
    private VisitorService visitorService;

    @PostMapping("/access")
    @ApiOperation(name = "记录访客访问", type = ApiOperationType.CREATE, description = "访客访问上报，24小时唯一访客，访问日志1小时一次")
    public Result<VisitorAccessResultVO> access(@RequestBody VisitorAccessDTO dto, HttpServletRequest request) {
        if (dto == null) {
            dto = new VisitorAccessDTO();
        }
        dto.setIp(RequestUtil.getClientIp(request));
        dto.setUserAgent(RequestUtil.getUserAgent(request));
        dto.setReferer(request.getHeader("Referer"));
        VisitorAccessResultVO vo = visitorService.recordAccess(dto);
        return Result.success(vo);
    }
}

