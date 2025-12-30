package com.blog.controller.admin;

import com.blog.annotation.ApiOperation;
import com.blog.model.enums.ApiOperationType;
import com.blog.common.PageResult;
import com.blog.common.Result;
import com.blog.model.dto.FileUploadDTO;
import com.blog.model.vo.FileVO;
import com.blog.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/file")
@ApiOperation(value = "file", name = "文件管理模块", description = "文件管理接口", open = false)
public class FileController {
    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    @ApiOperation(value = "upload", name = "上传文件", type = ApiOperationType.CREATE, description = "上传文件")
    public Result<FileVO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId,
            @RequestParam(required = false) String category) {
        FileUploadDTO dto = new FileUploadDTO();
        dto.setRefType(refType);
        dto.setRefId(refId);
        dto.setCategory(category);
        FileVO vo = fileService.upload(file, dto);
        return Result.success(vo);
    }

    @GetMapping("/list")
    @ApiOperation(value = "list", name = "查询文件列表", type = ApiOperationType.QUERY, description = "分页查询文件列表")
    public Result<PageResult<FileVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String type) {
        PageResult<FileVO> result = fileService.list(page, size, type);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "delete", name = "删除文件", type = ApiOperationType.DELETE, description = "删除文件")
    public Result<Void> delete(@PathVariable Long id) {
        fileService.delete(id);
        return Result.success();
    }
}
