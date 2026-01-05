package com.blog.modules.album.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.album.model.dto.AlbumDTO;
import com.blog.modules.album.model.vo.AlbumVO;
import com.blog.modules.album.service.AlbumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/album")
@ApiOperation(name = "相册管理模块", description = "相册管理接口", open = false)
public class AlbumController {
    @Autowired
    private AlbumService albumService;

    @GetMapping("/list")
    @ApiOperation(name = "查询相册列表", type = ApiOperationType.QUERY, description = "分页查询相册列表")
    public Result<PageResult<AlbumVO>> list(@RequestParam(required = false) Long page,
                                             @RequestParam(required = false) Long size,
                                             @RequestParam(required = false) Long userId,
                                             @RequestParam(required = false) String status) {
        PageResult<AlbumVO> result = albumService.list(page, size, userId, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取相册详情", type = ApiOperationType.QUERY, description = "根据ID获取相册详情")
    public Result<AlbumVO> getById(@PathVariable Long id) {
        AlbumVO vo = albumService.getById(id);
        if (vo == null) {
            return Result.error(404, "相册不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建相册", type = ApiOperationType.CREATE, description = "创建新相册")
    public Result<Long> create(@Valid @RequestBody AlbumDTO dto) {
        Long id = albumService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新相册", type = ApiOperationType.UPDATE, description = "更新相册信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody AlbumDTO dto) {
        albumService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除相册", type = ApiOperationType.DELETE, description = "删除相册")
    public Result<Void> delete(@PathVariable Long id) {
        albumService.delete(id);
        return Result.success();
    }
}

