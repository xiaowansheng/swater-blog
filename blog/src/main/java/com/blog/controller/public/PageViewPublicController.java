package com.blog.controller.public;

import com.blog.annotation.ApiResource;
import com.blog.common.Result;
import com.blog.model.vo.PageViewVO;
import com.blog.service.PageViewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/page-view")
@ApiResource(name = "访问量公开接口", isOpen = true)
public class PageViewPublicController {
    @Autowired
    private PageViewService pageViewService;

    @GetMapping("/{viewType}")
    public Result<PageViewVO> getViewCount(@PathVariable String viewType, @RequestParam(required = false) Long viewId) {
        PageViewVO vo = pageViewService.getViewCount(viewType, viewId);
        return Result.success(vo);
    }

    @GetMapping("/total/{viewType}")
    public Result<Long> getTotalViewCount(@PathVariable String viewType) {
        Long total = pageViewService.getTotalViewCount(viewType);
        return Result.success(total);
    }
}

