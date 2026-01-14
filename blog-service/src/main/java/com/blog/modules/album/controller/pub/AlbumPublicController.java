package com.blog.modules.album.controller.pub;


import com.blog.shared.annotation.ApiOperation;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.modules.album.model.vo.AlbumVO;
import com.blog.modules.album.service.AlbumPublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/public/album")
@ApiOperation(name = "相册公开接口", description = "相册相关接口", open = true)
public class AlbumPublicController {
    @Autowired
    private AlbumPublicService albumPublicService;

    @GetMapping("/list")
    @ApiOperation(name = "获取相册列表", type = ApiOperationType.QUERY, description = "分页获取相册列表")
    public Result<PageResult<AlbumVO>> list(@RequestParam(required = false) Long page,
                                             @RequestParam(required = false) Long size) {
        PageResult<AlbumVO> result = albumPublicService.list(page, size);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @ApiOperation(name = "获取相册详情", type = ApiOperationType.QUERY, description = "根据ID获取相册详情")
    public Result<AlbumVO> getById(@PathVariable Long id) {
        AlbumVO vo = albumPublicService.getById(id);
        if (vo == null) {
            return Result.error(404, "相册不存在");
        }
        return Result.success(vo);
    }

    @GetMapping("/key/{key}")
    @ApiOperation(name = "根据Key获取相册详情", type = ApiOperationType.QUERY, description = "根据相册的Key获取相册详情")
    public Result<AlbumVO> getByKey(@PathVariable String key) {
        AlbumVO vo = albumPublicService.getByKey(key);
        if (vo == null) {
            return Result.error(404, "相册不存在");
        }
        return Result.success(vo);
    }
}

