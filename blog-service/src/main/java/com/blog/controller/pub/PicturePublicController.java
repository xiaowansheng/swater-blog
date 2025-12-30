package com.blog.controller.pub;

import com.blog.annotation.ApiOperation;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.enums.ApiOperationType;
import com.blog.model.vo.PictureVO;
import com.blog.service.PicturePublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/picture")
@ApiOperation(value = "pub:picture", name = "图片公开接口", description = "图片相关接口", open = true)
public class PicturePublicController {
    @Autowired
    private PicturePublicQueryService picturePublicQueryService;

    @GetMapping("/list")
    @ApiOperation(value = "query", name = "获取图片列表", type = ApiOperationType.QUERY, description = "分页获取图片列表，可按相册筛选")
    public Result<PageResult<PictureVO>> list(@RequestParam(required = false) Long page,
                                              @RequestParam(required = false) Long size,
                                              @RequestParam(required = false) Long albumId) {
        PageResult<PictureVO> result = picturePublicQueryService.list(page, size, albumId);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "query", name = "获取图片详情", type = ApiOperationType.QUERY, description = "根据ID获取图片详情")
    public Result<PictureVO> getById(@PathVariable Long id) {
        PictureVO vo = picturePublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "图片不存在");
        }
        return Result.success(vo);
    }
}

