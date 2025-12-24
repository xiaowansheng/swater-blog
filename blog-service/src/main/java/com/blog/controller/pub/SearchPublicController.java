package com.blog.controller.pub;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.SearchVO;
import com.blog.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/search")
@ApiResource(name = "搜索接口", isOpen = true)
public class SearchPublicController {
    @Autowired
    private SearchService searchService;

    @GetMapping
    public Result<PageResult<SearchVO>> search(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size) {
        PageResult<SearchVO> result = searchService.search(keyword, type, page, size);
        return Result.success(result);
    }
}

