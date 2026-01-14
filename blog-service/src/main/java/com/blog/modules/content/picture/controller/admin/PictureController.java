package com.blog.modules.content.picture.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.content.picture.model.dto.PictureDTO;
import com.blog.modules.content.picture.model.vo.PictureVO;
import com.blog.modules.content.picture.service.PictureService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/picture")
@ApiOperation(name = "图片管理模块", description = "图片管理接口", open = false)
public class PictureController {
    @Autowired
    private PictureService pictureService;

    @GetMapping("/list")
    @ApiOperation(name = "查询图片列表", type = ApiOperationType.QUERY, description = "分页查询图片列表")
    public Result<PageResult<PictureVO>> list(@RequestParam(required = false) Long page,
                                               @RequestParam(required = false) Long size,
                                               @RequestParam(required = false) Long albumId) {
        PageResult<PictureVO> result = pictureService.list(page, size, albumId);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取图片详情", type = ApiOperationType.QUERY, description = "根据ID获取图片详情")
    public Result<PictureVO> getById(@PathVariable Long id) {
        PictureVO vo = pictureService.getById(id);
        if (vo == null) {
            return Result.error(404, "图片不存在");
        }
        return Result.success(vo);
    }

    @PostMapping
    @ApiOperation(name = "创建图片", type = ApiOperationType.CREATE, description = "创建新图片")
    public Result<Long> create(@Valid @RequestBody PictureDTO dto) {
        Long id = pictureService.create(dto);
        return Result.success(id);
    }

    @PutMapping("/{id}")
    @ApiOperation(name = "更新图片", type = ApiOperationType.UPDATE, description = "更新图片信息")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody PictureDTO dto) {
        pictureService.update(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除图片", type = ApiOperationType.DELETE, description = "删除图片")
    public Result<Void> delete(@PathVariable Long id) {
        pictureService.delete(id);
        return Result.success();
    }

    @PostMapping("/{id}/move")
    @ApiOperation(name = "移动图片", type = ApiOperationType.UPDATE, description = "移动图片到指定相册")
    public Result<Void> moveToAlbum(@PathVariable Long id, @RequestParam Long albumId) {
        pictureService.moveToAlbum(id, albumId);
        return Result.success();
    }
}

