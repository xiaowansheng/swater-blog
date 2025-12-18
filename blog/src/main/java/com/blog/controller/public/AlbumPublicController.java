package com.blog.controller.public;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.vo.AlbumVO;
import com.blog.service.AlbumPublicQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/album")
@ApiResource(name = "相册公开接口", isOpen = true)
public class AlbumPublicController {
    @Autowired
    private AlbumPublicQueryService albumPublicQueryService;

    @GetMapping("/list")
    public Result<PageResult<AlbumVO>> list(@RequestParam(required = false) Long page,
                                             @RequestParam(required = false) Long size) {
        PageResult<AlbumVO> result = albumPublicQueryService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<AlbumVO> getById(@PathVariable Long id) {
        AlbumVO vo = albumPublicQueryService.getById(id);
        if (vo == null) {
            return Result.error(404, "相册不存在");
        }
        return Result.success(vo);
    }
}

