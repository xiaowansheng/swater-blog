package com.blog.modules.search.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.search.model.vo.SearchVO;
import com.blog.modules.search.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/public/search")
@ApiOperation(name = "搜索接口", description = "搜索相关接口", open = true)
public class SearchPublicController {
    @Autowired
    private SearchService searchService;

    @GetMapping
    @ApiOperation(name = "搜索内容", type = ApiOperationType.QUERY, description = "根据关键词搜索文章、说说等内容")
    public Result<PageResult<SearchVO>> search(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long size) {
        PageResult<SearchVO> result = searchService.search(keyword, type, page, size);
        return Result.success(result);
    }
}

