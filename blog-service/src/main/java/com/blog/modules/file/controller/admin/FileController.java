package com.blog.modules.file.controller.admin;


import com.blog.shared.annotation.ApiOperation;
import com.blog.modules.system.api.model.enums.ApiOperationType;
import com.blog.shared.PageResult;
import com.blog.shared.Result;
import com.blog.modules.file.model.dto.FileUploadDTO;
import com.blog.modules.file.model.vo.FileVO;
import com.blog.modules.file.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/admin/file")
@ApiOperation(name = "文件管理模块", description = "文件管理接口", open = false)
public class FileController {
    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    @ApiOperation(name = "上传文件", type = ApiOperationType.CREATE, description = "上传文件")
    public Result<FileVO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId) {
        FileUploadDTO dto = new FileUploadDTO();
        dto.setRefType(refType);
        dto.setRefId(refId);
        // 后台管理上传不使用category，默认为null，会使用"original"
        dto.setCategory(null);
        FileVO vo = fileService.upload(file, dto);
        return Result.success(vo);
    }

    @PostMapping("/upload-by-url")
    @ApiOperation(name = "上传外链文件", type = ApiOperationType.CREATE, description = "通过URL上传文件")
    public Result<FileVO> uploadByUrl(
            @RequestParam("url") String url,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId) {
        FileUploadDTO dto = new FileUploadDTO();
        dto.setRefType(refType);
        dto.setRefId(refId);
        // 后台管理上传不使用category，默认为null，会使用"original"
        dto.setCategory(null);
        FileVO vo = fileService.uploadByUrl(url, dto);
        return Result.success(vo);
    }

    @GetMapping("/list")
    @ApiOperation(name = "查询文件列表", type = ApiOperationType.QUERY, description = "分页查询文件列表")
    public Result<PageResult<FileVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String type) {
        PageResult<FileVO> result = fileService.list(page, size, type);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    @ApiOperation(name = "删除文件", type = ApiOperationType.DELETE, description = "删除文件")
    public Result<Void> delete(@PathVariable Long id) {
        fileService.delete(id);
        return Result.success();
    }
}
