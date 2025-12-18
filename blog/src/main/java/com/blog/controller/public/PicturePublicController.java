package com.blog.controller.public;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.PictureVO;
import com.blog.service.PicturePublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/picture")
@ApiResource(name = "图片公开接口", isOpen = true)
public class PicturePublicController {
    @Autowired
    private PicturePublicQueryService picturePublicQueryService;

    @GetMapping("/list")
    public Result<PageResult<PictureVO>> list(@RequestParam(required = false) Long page,
                                              @RequestParam(required = false) Long size,
                                              @RequestParam(required = false) Long albumId) {
        PageResult<PictureVO> result = picturePublicQueryService.list(page, size, albumId);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<PictureVO> getById(@PathVariable Long id) {
        PictureVO vo = picturePublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "图片不存在");
        }
        return Result.success(vo);
    }
}

