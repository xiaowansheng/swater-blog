package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.PictureDTO;
import com.blog.model.vo.PictureVO;
import com.blog.service.PictureService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/picture")
@ApiResource(name = "图片管理接口")
public class PictureController {
    @Autowired
    private PictureService pictureService;

    @GetMapping("/list")
    public Result<PageResult<PictureVO>> list(@RequestParam(required = false) Long page,
                                               @RequestParam(required = false) Long size,
                                               @RequestParam(required = false) Long albumId) {
        PageResult<PictureVO> result = pictureService.list(page, size, albumId);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<PictureVO> getById(@PathVariable Long id) {
        PictureVO vo = pictureService.getById(id);
        if (vo == null) {
            return Result.error(404, "图片不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody PictureDTO dto) {
        Long id = pictureService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody PictureDTO dto) {
        pictureService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        pictureService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/move")
    public Result<Void> moveToAlbum(@PathVariable Long id, @RequestParam Long albumId) {
        pictureService.moveToAlbum(id, albumId);
        return Result.success();
    }
}

