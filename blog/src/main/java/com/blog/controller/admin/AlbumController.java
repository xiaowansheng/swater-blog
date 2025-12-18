package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.AlbumDTO;
import com.blog.model.vo.AlbumVO;
import com.blog.service.AlbumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/album")
@ApiResource(name = "相册管理接口")
public class AlbumController {
    @Autowired
    private AlbumService albumService;

    @GetMapping("/list")
    public Result<PageResult<AlbumVO>> list(@RequestParam(required = false) Long page,
                                             @RequestParam(required = false) Long size,
                                             @RequestParam(required = false) Long userId,
                                             @RequestParam(required = false) String status) {
        PageResult<AlbumVO> result = albumService.list(page, size, userId, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<AlbumVO> getById(@PathVariable Long id) {
        AlbumVO vo = albumService.getById(id);
        if (vo == null) {
            return Result.error(404, "相册不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody AlbumDTO dto) {
        Long id = albumService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AlbumDTO dto) {
        albumService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        albumService.delete(id);
        return Result.success();
    }
}

