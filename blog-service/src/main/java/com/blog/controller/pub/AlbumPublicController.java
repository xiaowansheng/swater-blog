package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.AlbumVO;
import com.blog.service.AlbumPublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/album")
@ApiOperation(name = "相册公开接口", description = "相册相关接口", open = true)
public class AlbumPublicController {
    @Autowired
    private AlbumPublicQueryService albumPublicQueryService;

    @GetMapping("/list")
    @ApiOperation(name = "获取相册列表", type = ApiOperationType.QUERY, description = "分页获取相册列表")
    public Result<PageResult<AlbumVO>> list(@RequestParam(required = false) Long page,
                                             @RequestParam(required = false) Long size) {
        PageResult<AlbumVO> result = albumPublicQueryService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取相册详情", type = ApiOperationType.QUERY, description = "根据ID获取相册详情")
    public Result<AlbumVO> getById(@PathVariable Long id) {
        AlbumVO vo = albumPublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "相册不存在");
        }
        return Result.success(vo);
    }
}

