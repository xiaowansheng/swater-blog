package com.blog.controller.admin;

import com.blog.annotation.ApiResource;
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
@ApiResource(name = "文件管理接口")
public class FileController {
    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public Result<FileVO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId) {
        FileUploadDTO dto = new FileUploadDTO();
        dto.setRefType(refType);
        dto.setRefId(refId);
        FileVO vo = fileService.upload(file, dto);
        return Result.success(vo);
    }

    @GetMapping("/list")
    public Result<PageResult<FileVO>> list(
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String type) {
        PageResult<FileVO> result = fileService.list(page, size, type);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        fileService.delete(id);
        return Result.success();
    }
}

